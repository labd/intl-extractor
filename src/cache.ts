import type { LabelData } from "./types";

/**
 * Produces the value for a label that has no entry in the source yet. Receives
 * the full key path (namespace segments followed by label segments), so a caller
 * can mark the value as untranslated however it likes — e.g. `[label]`.
 */
export type LabelFallback = (path: Array<string>) => string;

/** Default: the last path segment, i.e. the label's own name. */
const defaultFallback: LabelFallback = (path) => path[path.length - 1] ?? "";

/**
 * Update existing label cache based on given data and source labels
 */
export function updateLabelCache({
	cache,
	source,
	data,
	fallback = defaultFallback,
}: {
	cache: LabelData;
	source: LabelData;
	data: Record<string, Set<string>>;
	fallback?: LabelFallback;
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

		// The individual keys can be nested, so we need to traverse through them and expand the cache
		for (const value of values) {
			const valueKey = value.split(".");
			let currentNestedCache = currentCache;

			if (valueKey.length > 1) {
				// For nested keys, create the object structure but stop before the last key
				for (let i = 0; i < valueKey.length - 1; i++) {
					const key = valueKey[i];
					currentNestedCache[key] = currentNestedCache[key] || {};
					currentNestedCache = currentNestedCache[key] as LabelData;
				}

				// The last key should be a string value, not an object
				const lastKey = valueKey[valueKey.length - 1];
				currentNestedCache[lastKey] =
					getLabelFromData(source, [...keys, value]) ||
					fallback([...keys, ...valueKey]);
			} else {
				// For non-nested keys, simply add the value
				currentNestedCache[value] =
					getLabelFromData(source, [...keys, value]) ||
					fallback([...keys, value]);
			}
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
	path: Array<string>,
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
