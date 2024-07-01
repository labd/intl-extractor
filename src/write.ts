import * as fs from "fs";
import * as glob from "glob";
import { findTranslationsUsage } from "./parse-new";

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
export async function writeTranslations(
	rootPath: string,
	output: string
): Promise<void> {
	const cache: LabelData = {};
	const pattern = "**/*.{ts,tsx}";

	const options = {
		cwd: rootPath,
		absolute: true,
	};

	// The source file with existing labels should be the current output
	const sourceFile = await fs.promises.readFile(output, "utf8");

	if (!sourceFile) {
		console.info("No existing source file found, will build from scratch");
	}

	const source = JSON.parse(sourceFile) as unknown as LabelData;

	const files = glob.sync(pattern, options);
	for (const file of files) {
		const data = await findTranslationsUsage(file);
		// This might not be performant as we do existign source look ups for every added file
		updateCache({ cache, data, source });
	}

	// Write the new output
	fs.promises.writeFile(output, JSON.stringify(cache, null, "\t") + "\n");
}

/**
 * Update existing cache based on given data and source labels
 */
function updateCache({
	cache,
	source,
	data,
}: {
	cache: LabelData;
	source: LabelData;
	data: Record<string, Set<string>>;
}) {
	for (const key of Object.keys(data)) {
		const keys = key.split(".");
		const keyMap = [];
		let currentCache = cache;
		for (let i = 0; i < keys.length; i++) {
			const currentKey = keys[i];
			keyMap.push(currentKey);
			if (i === keys.length - 1) {
				if (currentCache[currentKey] === undefined) {
					currentCache[currentKey] = {};
				}

				for (const value of data[key]) {
					// Check the existing source for label or fill with the key
					(currentCache[currentKey] as LabelData)[value] =
						getLabelFromExisting([...keyMap, value], source) || value;
				}
			} else {
				if (currentCache[currentKey] === undefined) {
					currentCache[currentKey] = {};
				}

				currentCache = currentCache[currentKey] as LabelData;
			}
		}
	}
}

/**
 * Traverse through label data and find existing label or return undefined
 * @param keyMap Array of keys to traverse through
 * @param source
 * @returns
 */
function getLabelFromExisting(
	keyMap: Array<string>,
	source: LabelData
): string | undefined {
	let record: LabelData | string = source;
	for (const key of keyMap) {
		if (typeof record === "object" && key in record) {
			record = record[key];
		} else {
			return undefined;
		}
	}

	// Only return label if it's actually a string
	return typeof record === "string" ? record : undefined;
}
