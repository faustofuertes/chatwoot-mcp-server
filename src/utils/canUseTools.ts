export function canUseTool(config: { TOOLS_TO_USE: string[] }, toolName: string): boolean {
	return config.TOOLS_TO_USE.includes(toolName);
}