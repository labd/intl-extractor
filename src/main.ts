import * as glob from "glob";
import * as fs from "node:fs";
import { updateLabelCache } from "./cache";
import { extractLabelsFromFile } from "./extract";
import type { LabelData } from "./types";

/**
 * Main function that collects labels, source file and writes it to the output
 * @param rootPath Root path of typescript files to check
 * @param output JSON file to use for output labels
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
		const data = await extractLabelsFromFile(file);

		// Update cache if we get results from a file
		if (Object.keys(data).length > 0) {
			console.info(`Updating labels for ${file}`);
			// This might not be performant as we do existign source look ups for every added file
			updateLabelCache({ cache, data, source });
		}
	}

	// Write the new output
	fs.promises.writeFile(output, `${JSON.stringify(cache, null, "\t")}\n`);
}

const watchCache: LabelData = {};

export async function processFile(file: string, output: string): Promise<void> {
	const sourceFile = await fs.promises.readFile(output, "utf8");

	if (!sourceFile) {
		// If someone deletes the source file, we should throw an error as we won't recreate it in this function
		throw new Error(
			"No existing source file found during watch, please run the process first"
		);
	}

	let source;
	try {
		source = JSON.parse(sourceFile) as unknown as LabelData;
	} catch (err) {
		console.error(`Error parsing source file: ${output}`);
		throw err;
	}

	const data = await extractLabelsFromFile(file);

	if (Object.keys(data).length > 0) {
		console.info(`Updating labels for ${file}`);

		updateLabelCache({ cache: watchCache, data, source });
	}

	fs.promises.writeFile(output, `${JSON.stringify(watchCache, null, "\t")}\n`);
}
