import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: ["src/bin/cli.ts", "src/index.ts"],
		publint: true,
		failOnWarn: true,
		// TypeScript 7 is used on purpose; its "experimental API" notice is not actionable
		suppressWarnings: ["TypeScript 7.0 does not yet have a stable API"],
		clean: true,
		splitting: false,
		dts: true,
		sourcemap: true,
		format: ["esm"],
		outDir: "dist",
		shims: true,
		fixedExtension: false,
	},
]);
