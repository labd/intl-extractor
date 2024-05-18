import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { writeTranslations } from "../write";

// Setup yargs to use the command modules from the commands directory

async function main() {
	yargs(hideBin(process.argv))
		.usage("$0 --source [path] --output [json file]")
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
			output: {
				type: "string",
				alias: "o",
				describe: "Output file",
				demandOption: true,
			},
		})
		.command(
			"$0",
			"Default command",
			() => {},
			async (argv) => {
				for (const source of argv.source) {
					await writeTranslations(source, argv.output);
				}
				// Process the source directories
			}
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
