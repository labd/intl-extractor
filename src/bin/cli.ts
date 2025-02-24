import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { processFiles } from "../main";

// Setup yargs to use the command modules from the commands directory

async function main() {
	yargs(hideBin(process.argv))
		.usage("$0 --input [path] --output [json file]")
		.options({
			input: {
				type: "string",
				alias: "i",
				describe: "Source directory to process",
			},
			output: {
				type: "string",
				alias: "o",
				describe: "Output file",
				demandOption: true,
			},
			watch: {
				type: "boolean",
				alias: "w",
				describe: "Watch for changes and rerun the process",
				default: false,
			},
		})
		.command(
			"$0",
			"Default command",
			(yargs) => {
				// This makes it hard to show our error message and the stacktrace next to eachother
				yargs.showHelpOnFail(false);
			},
			async (argv) => {
				if (!argv.input) {
					throw new Error("Input directory is required");
				}

				await processFiles([argv.input], argv.output);

				if (argv.watch) {
					console.info("Watching for changes...");
					const watcher = await import("@parcel/watcher");

					if (!watcher) {
						throw new Error(
							"Watcher not found, please install @parcel/watcher",
						);
					}

					watcher.subscribe(
						argv.input,
						async (err) => {
							if (err) {
								throw new Error(err.message);
							}

							if (!argv.input) {
								// Appeasing typescript
								throw new Error("Input directory is required");
							}

							// Simple implementation: reprocess all files as to avoid complex cache work
							// No need to run individual events as we're updating everything anyways
							await processFiles([argv.input], argv.output);
						},
						// Negative glob to still match our pattern for events
						{ ignore: ["!**/*.{ts,tsx}"] },
					);
				}
			},
		)
		.help()
		.alias("help", "h")
		.parse();
}

// Run the application
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
