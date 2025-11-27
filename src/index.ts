import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getLead, moveLead } from "./tools/leads";
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

		/*this.server.tool(
			"get_lead",
			"Retrieve detailed information for a specific lead using its lead ID.",
			{
				lead_id: z.number().describe("Unique ID assigned by Kommo CRM to the lead. This identifier is used to fetch all related information for a specific lead within the system.")
			},
			async ({ lead_id }) => {
				try {

					const kommoCLient = this.getConfig();
					const lead = await getLead(lead_id, kommoCLient);

					if (lead !== null) {
						return { content: [{ type: "text", text: `Lead information:\n${JSON.stringify(lead, null, 2)}` }] };
					}

					return { content: [{ type: 'text', text: `Lead not found.` }] }

				} catch (error) {
					return { content: [{ type: 'text', text: 'Error fetching lead.' }] }
				}
			}
		);*/

		this.server.tool(
			"move_lead",
			"This tool is useful when you have to move a lead to a diferent pipeline.",
			{
				lead_id: z.number().describe("Unique ID assigned by Kommo CRM to the lead. This identifier is used to fetch all related information for a specific lead within the system."),
				pipeline_id: z.number().describe("Id of the pipelinle the lead is supose to be moved in"),
				status_id: z.number().describe("Id of the column of the pipeline the lead is supose to be moved in")
			},
			async ({ lead_id, pipeline_id, status_id }) => {
				try {

					const kommoCLient = this.getConfig();
					const lead = await getLead(lead_id, kommoCLient);

					if (lead === null) {
						return { content: [{ type: "text", text: "Error moving lead (lead not found)." }] }
					}

					const res = await moveLead(lead_id, pipeline_id, status_id, kommoCLient);

					if (res === null) {
						return { content: [{ type: "text", text: "Error moving lead." }] }
					}

					return { content: [{ type: "text", text: "Lead moved succesfully." }] }
				} catch (error) {
					return { content: [{ type: "text", text: "Error moving lead." }] }
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
