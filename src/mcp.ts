import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canUseTool } from "./utils/canUseTools";
import { addTagToConversation } from "./tools/conversations";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Kommo MCP",
		version: "1.0.0",
	});

	private getConfig() {
		return (this as any).props;
	}

	async init() {

		const chatwootClient = this.getConfig();

		/*──────────────── add_tag ──────────────*/
		if (canUseTool(chatwootClient, "add_tag")) {
			this.server.tool(
				"add_tag",
				"This tool adds a tag to a specific conversation in Chatwoot.",
				{
					conversation_id: z
						.number()
						.describe("Unique ID assigned by Chatwoot to the conversation. This identifier is used to fetch all related information for a specific conversation within the system."),
					labels: z
						.array(z.string())
						.describe("Body of the request: { \"labels\": [] }. Array of label strings to add. conversation_id is sent only in the URL (path variable), not in the body."),
				},
				async ({ conversation_id, labels }) => {
					try {

						const res = await addTagToConversation(conversation_id, labels, chatwootClient);

						if (res === null) {
							return {
								content: [
									{
										type: "text",
										text: "Failed to add tag: Chatwoot API rejected the request. Please verify the labels are valid and exists in your Chatwoot account."
									}
								]
							}
						}

						return {
							content: [
								{
									type: "text",
									text: "Tag added successfully."
								}
							]
						}
					} catch (error) {
						console.error("💥 [add_tag] Error:", error);
						return {
							content: [
								{
									type: "text",
									text: `Error al añadir tag a la conversación: ${(error as Error).message || String(error)}`
								}
							]
						}
					}
				}
			);
		}

	}
}