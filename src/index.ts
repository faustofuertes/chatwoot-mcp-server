import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getLead } from "./tools/leads";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Kommo MCP",
		version: "1.0.0",
	});

	async init() {

		this.server.tool(
			"get_lead",
			"Retrieve detailed information for a specific lead using its lead ID.",
			{
				lead_id: z.number().describe("Unique ID assigned by Kommo CRM to the lead. This identifier is used to fetch all related information for a specific lead within the system.")
			},
			async ({ lead_id }) => {
				try {
					const lead = await getLead(lead_id);

					if (lead !== null) {
						return { content: [{ type: "text", text: `Lead information:\n${JSON.stringify(lead, null, 2)}` }] };
					}

					return { content: [{ type: 'text', text: `Lead not found.` }] }

				} catch (error) {
					return { content: [{ type: 'text', text: 'Error fetching lead.' }] }
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
