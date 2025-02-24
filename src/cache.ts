import type { LabelData } from "./types";

/**
 * Update existing label cache based on given data and source labels
 */
export function updateLabelCache({
	cache,
	source,
	data,
}: {
	cache: LabelData;
	source: LabelData;
	data: Record<string, Set<string>>;
}) {
	for (const [key, values] of Object.entries(data)) {
		// Next-intl uses dot notation for nested objects
		const keys = key.split(".");
		let currentCache = cache;

		// Set up the namespace in the cache
		for (let i = 0; i < keys.length; i++) {
			const currentKey = keys[i];
			currentCache[currentKey] = currentCache[currentKey] || {};
			currentCache = currentCache[currentKey] as LabelData;
		}

		// Add values for each label, try the existing source first
		// or use the namespace with name as a value
		for (const value of values) {
			currentCache[value] =
				getLabelFromData(source, [...keys, value]) || `${key}.${value}`;
		}
	}
}

/**
 * Traverse through label data and find existing label or return undefined
 * @param path Array of keys to traverse through
 * @param source Label data object to get label from
 * @returns String value if available or undefined if not
 */
function getLabelFromData(
	source: LabelData,
	path: Array<string>
): string | undefined {
	let current: LabelData | string = source;
	for (const key of path) {
		if (
			typeof current !== "object" ||
			current[key] === undefined ||
			!(key in current)
		) {
			return undefined;
		}

		current = current[key];
	}

	// Only return label if it's actually a string
	return typeof current === "string" ? current : undefined;
}
