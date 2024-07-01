import * as fs from "fs";
import * as glob from "glob";
import { findTranslationsUsage } from "./parse";

/**
 * Recursive type for labels which can be nested objects containing strings
 */
type LabelData = {
	[key: string]: string | LabelData;
};

/**
 * Main function that collects labels, source file and writes it to the output
 * @param rootPath Root path of typescript files to check
 * @param output JSON file to use for output labels
 *
 */
export async function processFiles(
	directories: Array<string>,
	output: string
): Promise<void> {
	const cache: LabelData = {};
	const pattern = "**/*.{ts,tsx}";

	// The source file with existing labels should be the current output
	const sourceFile = await fs.promises.readFile(output, "utf8");

	if (!sourceFile) {
		console.info("No existing source file found, will build from scratch");
	}

	let source;
	try {
		source = JSON.parse(sourceFile) as unknown as LabelData;
	} catch (err) {
		console.error(`Error parsing source file: ${output}`);
		throw err;
	}

	// Collect list of files based on given directories to check
	const files = directories.flatMap((path) =>
		glob.sync(pattern, {
			cwd: path,
			absolute: true,
		})
	);

	for (const file of files) {
		const data = await findTranslationsUsage(file);

		// Update cache if we get results from a file
		if (Object.keys(data).length > 0) {
			console.info(`Updating labels for ${file}`);
			// This might not be performant as we do existign source look ups for every added file
			updateCache({ cache, data, source });
		}
	}

	// Write the new output
	fs.promises.writeFile(output, JSON.stringify(cache, null, "\t") + "\n");
}

/**
 * Update existing cache based on given data and source labels
 */
export function updateCache({
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
				getLabelFromExisting([...keys, value], source) || `${key}.${value}`;
		}
	}
}

/**
 * Traverse through label data and find existing label or return undefined
 * @param path Array of keys to traverse through
 * @param source
 * @returns String value if available or undefined if not
 */
function getLabelFromExisting(
	path: Array<string>,
	source: LabelData
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
