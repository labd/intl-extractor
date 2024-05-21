type WriteCacheObject = { [key: string]: WriteCacheObject | string };

import * as fs from "fs";
import * as glob from "glob";
import { findTranslationsUsage } from "./parse-new";

function isWriteCacheObject(
	obj: string | WriteCacheObject
): obj is WriteCacheObject {
	return typeof obj === "object";
}

export async function writeTranslations(
	rootPath: string,
	output: string
): Promise<void> {
	const cache: WriteCacheObject = {};
	const pattern = "**/*.{ts,tsx}";

	const options = {
		cwd: rootPath,
		absolute: true,
	};

	const files = glob.sync(pattern, options);
	for (const file of files) {
		const data = await findTranslationsUsage(file);
		updateCache(cache, data);
	}

	updateOutputFile(output, cache);
}

function updateCache(
	cache: WriteCacheObject,
	data: Record<string, Set<string>>
) {
	for (const key of Object.keys(data)) {
		const keys = key.split(".");
		let currentCache = cache;
		for (let i = 0; i < keys.length; i++) {
			const currentKey = keys[i];
			if (i === keys.length - 1) {
				if (currentCache[currentKey] === undefined) {
					currentCache[currentKey] = {};
				}

				for (const value of data[key]) {
					currentCache[currentKey][value] = value;
				}
			} else {
				if (currentCache[currentKey] === undefined) {
					currentCache[currentKey] = {};
				}

				currentCache = currentCache[currentKey];
			}
		}
	}
}

async function updateOutputFile(file: string, cache: WriteCacheObject) {
	// Compare the output file with the cache
	let existingData = {};

	if (fs.existsSync(file)) {
		// Read the existing data
		const fileContent = await fs.promises.readFile(file, "utf8");
		existingData = JSON.parse(fileContent);
	}

	// Recursively delete keys from existing data if they don't exist
	// in the cache
	removeKeysFromObject(existingData, cache);

	// Recursively copy new items
	copyKeysToObject(existingData, cache);

	console.log(existingData);
}

function removeKeysFromObject(data: WriteCacheObject, cache: WriteCacheObject) {
	const dataKeys = Object.keys(data);
	const keys = Object.keys(cache);
	for (const key of dataKeys) {
		if (!keys.includes(key)) {
			// Key doesn't exist in the cache, no need to check further
			delete data[key];
			continue;
		}

		if (isWriteCacheObject(data[key]) && isWriteCacheObject(cache[key])) {
			// Both are objects, we go deeper
			removeKeysFromObject(
				data[key] as WriteCacheObject,
				cache[key] as WriteCacheObject
			);
		}
	}
}

function copyKeysToObject(data: WriteCacheObject, cache: WriteCacheObject) {
	const keys = Object.keys(cache);
	for (const key of keys) {
		if (data[key] === undefined) {
			// Key doesn't exist in the data, copy it from the cache
			data[key] = cache[key];
		} else {
			if (isWriteCacheObject(data[key]) && isWriteCacheObject(cache[key])) {
				// Both are objects, recurse into deeper object
				// TODO: Fix predicate so we can remove the type assertion
				copyKeysToObject(
					data[key] as WriteCacheObject,
					cache[key] as WriteCacheObject
				);
			}
		}
	}
}
