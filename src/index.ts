import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getLead, moveLead, pauseLeadAgent } from "./tools/leads";
import { Env } from "./types";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Kommo MCP",
		version: "1.0.0",
	});

	private getConfig() {
		return (this as any).props;
	}

	async init() {

		const kommoCLient = this.getConfig();

		this.server.tool(
			"move_lead",
			"This tool is useful when you need to move a lead to a different pipeline.",
			{
				lead_id: z.number().describe("Unique ID assigned by Kommo CRM to the lead. This identifier is used to fetch all related information for a specific lead within the system."),
				pipeline_id: z.number().describe("ID of the pipeline where the lead should be moved."),
				status_id: z.number().describe("ID of the stage within the target pipeline where the lead should be placed.")
			},
			async ({ lead_id, pipeline_id, status_id }) => {
				try {

					const lead = await getLead(lead_id, kommoCLient);

					if (lead === null) {
						return { content: [{ type: "text", text: "Failed to move lead: the specified lead does not exist in Kommo." }] }
					}

					const res = await moveLead(lead_id, pipeline_id, status_id, kommoCLient);

					if (res === null) {
						return { content: [{ type: "text", text: "Failed to move lead: Kommo did not accept the update request." }] }
					}

					return { content: [{ type: "text", text: "Lead successfully moved to the specified pipeline and status." }] }

				} catch (error) {
					return { content: [{ type: "text", text: "Unexpected error while attempting to move the lead." }] }
				}
			}
		);

		this.server.tool(
			"pause_agent",
			"This tool pauses the assigned agent for a specific lead.",
			{
				lead_id: z.number().describe("Unique ID assigned by Kommo CRM to the lead. This identifier is used to fetch all related information for a specific lead within the system.")
			},
			async ({ lead_id }) => {
				try {

					const lead = await getLead(lead_id, kommoCLient);

					if (lead === null) {
						return { content: [{ type: "text", text: "Failed to pause agent: the specified lead does not exist in Kommo." }] }
					}

					await pauseLeadAgent(lead_id, kommoCLient);
					return { content: [{ type: "text", text: "Agent successfully paused for the specified lead." }] }

				} catch (error) {
					return { content: [{ type: "text", text: "Unexpected error while attempting to pause the agent." }] }
				}
			}
		);

	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// 1. Leer headers si existen
		const headerToken = request.headers.get("KOMMO_LONG_DURATION_TOKEN");
		const headerSubdomain = request.headers.get("KOMMO_ACCOUNT_SUBDOMAIN");

		// 2. Elegir header > env
		const finalConfig = {
			KOMMO_LONG_DURATION_TOKEN:
				headerToken || env.KOMMO_LONG_DURATION_TOKEN,
			KOMMO_ACCOUNT_SUBDOMAIN:
				headerSubdomain || env.KOMMO_ACCOUNT_SUBDOMAIN,
		};

		// 3. Inyectar las variables en ctx.props
		const context = Object.assign(Object.create(ctx), ctx, {
			props: {
				...(ctx as any).props,
				...finalConfig,
			},
		});

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, context);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, context);
		}

		return new Response("Not found", { status: 404 });
	},
};