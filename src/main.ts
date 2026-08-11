import * as fs from "node:fs";
import * as glob from "glob";
import { type LabelFallback, updateLabelCache } from "./cache";
import { extractLabelsFromFile } from "./extract";
import type { LabelData } from "./types";

export type BuildLabelsOptions = {
	/** Root path of typescript files to scan. */
	input: string;
	/** Existing labels to take values from. Anything absent gets `fallback`. */
	source?: LabelData;
	/** Value for a label with no entry in `source`. Defaults to the label name. */
	fallback?: LabelFallback;
	/** Called for each file that contributed labels. */
	onFile?: (file: string) => void;
};

/**
 * Scan `input` for `useTranslations` / `getTranslations` usage and return the
 * label tree, taking values from `source` where it has them. Does no file IO on
 * the result — use it to compose the output yourself; {@link processFiles} is
 * the read-merge-write wrapper the CLI uses.
 */
export async function buildLabels({
	input,
	source = {},
	fallback,
	onFile,
}: BuildLabelsOptions): Promise<LabelData> {
	const cache: LabelData = {};
	const pattern = "**/*.{ts,tsx}";

	// Collect list of files based on given directory to check
	const files = glob.sync(pattern, {
		cwd: input,
		absolute: true,
	});

	for (const file of files) {
		const data = await extractLabelsFromFile(file);

		// Update cache if we get results from a file
		if (Object.keys(data).length > 0) {
			onFile?.(file);
			// This might not be performant as we do existing source look ups for every added file
			updateLabelCache({ cache, data, source, fallback });
		}
	}

	return deepSortObject(cache);
}

/**
 * Main function that collects labels, source file and writes it to the output
 * @param input Root path of typescript files to check
 * @param output JSON file to use for output labels
 */
export async function processFiles(
	input: string,
	output: string,
): Promise<void> {
	// The source file with existing labels should be the current output
	const source = await readSource(output);

	const labels = await buildLabels({
		input,
		source,
		onFile: (file) => {
			console.info(`Updating labels for ${file}`);
		},
	});

	// Write the new output
	await fs.promises.writeFile(
		output,
		`${JSON.stringify(labels, null, "\t")}\n`,
	);
}

/** Read the existing output file, treating a missing one as no labels yet. */
async function readSource(output: string): Promise<LabelData> {
	let contents: string;
	try {
		contents = await fs.promises.readFile(output, "utf8");
	} catch {
		console.info("No existing source file found, will build from scratch");
		return {};
	}

	if (!contents.trim()) {
		return {};
	}

	try {
		return JSON.parse(contents) as LabelData;
	} catch (err) {
		console.error(`Error parsing source file: ${output}`);
		throw err;
	}
}

/**
 * Recursively sorts the keys of an object.
 */
function deepSortObject<T>(obj: T): T {
	if (Array.isArray(obj)) {
		return obj.map(deepSortObject) as unknown as T;
	} else if (obj && typeof obj === "object" && obj.constructor === Object) {
		const sorted: Record<string, unknown> = {};
		for (const key of Object.keys(obj).sort()) {
			sorted[key] = deepSortObject((obj as Record<string, unknown>)[key]);
		}
		return sorted as T;
	}
	return obj;
}
