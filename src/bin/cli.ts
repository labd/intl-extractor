import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { processFiles } from "../main";

// Setup yargs to use the command modules from the commands directory

async function main() {
	yargs(hideBin(process.argv))
		.usage("$0 --input [path] --output [json file]")
		.options({
			input: {
				type: "array",
				alias: "i",
				describe: "Source directories to process",
				demandOption: true, // Require at least one source path
				coerce: (arg: string | Array<string>) => {
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
			exitProcess: {
				default: "false",
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
				await processFiles(argv.input, argv.output);
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
