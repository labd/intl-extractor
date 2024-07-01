export type CacheContents = Map<string, CacheContents | string>;


/**
 * Workflow for building cache
 *
 * 1. Load and parse files to create initial cache
 * 2. Merge with existing source.json
 * 		a. If label exists in source.json, keep it with existing source.json value
 * 		b. If it doesn't exist, do nothing
 */

// Note: for each of the keys in the cache, check if there is a value available in source.json
