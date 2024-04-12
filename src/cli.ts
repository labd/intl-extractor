import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { processTypescriptFilesSync } from "./main";

// Setup yargs to use the command modules from the commands directory
yargs(hideBin(process.argv))
	.usage("$0 --source [path]")
	.options({
		source: {
			type: "array",
			alias: "s",
			describe: "Source directories to process",
			demandOption: true, // Require at least one source path
			coerce: (arg: string | string[]) => {
				// Ensure that the input is always an array of strings
				if (typeof arg === "string") {
					return [arg];
				}
				return arg;
			},
		},
	})
	.command(
		"$0",
		"Default command",
		() => {},
		async (argv) => {
			for (const source of argv.source) {
				await processTypescriptFilesSync(source);
			}
			// Process the source directories
		}
	)
	.help()
	.alias("help", "h")
	.parse();
