import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/bin/cli.ts", "src/index.ts"],
		clean: true,
		splitting: false,
		dts: true,
		sourcemap: true,
		format: ["esm"],
		outDir: "dist",
		shims: true,
	},
]);
