export function parseTools(headerValue: string | null, envValue: unknown): string[] {
	// Si no vino el header, usar env siempre que sea array
	if (!headerValue) {
		return Array.isArray(envValue) ? envValue as string[] : [];
	}

	const trimmed = headerValue.trim();

	// Caso JSON: ["a","b","c"]
	if (trimmed.startsWith("[")) {
		try {
			const parsed = JSON.parse(trimmed);
			return Array.isArray(parsed)
				? parsed.map(String)
				: [];
		} catch {
			return [];
		}
	}

	// Caso CSV: a,b,c
	return trimmed
		.split(",")
		.map(v => v.trim())
		.filter(v => v.length > 0);
}