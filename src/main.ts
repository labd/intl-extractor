import { promises as fsPromises } from "fs";
import * as path from "path";
import * as glob from "glob";
import * as fs from "fs";
import { findTranslationsUsage } from "./parse";

// Function to find and process all *.ts files synchronously
export const processTypescriptFilesSync = async (
	rootPath: string
): Promise<void> => {
	const pattern = "**/*.{ts,tsx}";

	const options = {
		cwd: rootPath,
		absolute: true,
	};

	const files = glob.sync(pattern, options);
	for (const file of files) {
		const data = await findTranslationsUsage(file);
		writeTranslations(file, data);
	}
};

async function writeTranslations(file: string, result: Record<string, any>) {
	let existingData: Record<string, any> = {};
	const target = createOutputFilename(file);

	if (Object.keys(result).length === 0) {
		if (fs.existsSync(target)) {
			fs.unlinkSync(target);
		}
		return;
	}

	// Check if the file exists
	if (fs.existsSync(target)) {
		// Read the existing data
		const fileContent = await fs.promises.readFile(target, "utf8");
		existingData = JSON.parse(fileContent);
	}

	// Delete keys from existing data if they don't exist
	for (const key of Object.keys(existingData)) {
		if (result[key] === undefined) {
			delete existingData[key];
		}
	}

	// Copy new items
	for (const key of Object.keys(result)) {
		if (existingData[key] === undefined) {
			existingData[key] = result[key];
		}
	}

	fsPromises.writeFile(target, JSON.stringify(existingData, null, "\t"));
}

// Function to generate the output JSON filename based on the input TypeScript filename
function createOutputFilename(inputFilePath: string) {
	const directory = path.dirname(inputFilePath);
	const filename = path.basename(inputFilePath);
	const parsed = path.parse(filename);
	return path.join(directory, `${parsed.name}.labels.json`);
}
