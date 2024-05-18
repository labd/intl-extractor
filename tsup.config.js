import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/bin/index.ts"],
		clean: true,
		splitting: false,
		dts: false,
		sourcemap: false,
		format: ["cjs"],
		outDir: "dist",
		shims: true,
	},
]);
