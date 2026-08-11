# intl-extractor

Extracts `next-intl` labels from TypeScript files and merges them to a given output json file.

This automates away manually setting labels in a `source.json` file.

## How to use

```bash
npx @labdigital/intl-extractor -i ./path/to/files -o ./path/to/output.json
```

## Programmatic use

```ts
import { buildLabels } from "@labdigital/intl-extractor";

const labels = await buildLabels({
  input: "./src",
  source: existingLabels,                    // values to keep
  fallback: (path) => `[${path.at(-1)}]`,    // value for a label with no entry yet
});
```

`buildLabels` returns the tree and writes nothing, so you can merge it with labels from
elsewhere before deciding what the output file should be. `processFiles` is the
read-merge-write wrapper the CLI uses.

## How it works

Scans input files for `useTranslations` or `getTranslations` usage using the TypeScript SDK. It will then merge them all together and check the source JSON file for label values.

## Watch mode

You can use watch mode by installing `@parcel/watcher` and using the `--watch` or `-w` flag. It's a really simple implementation that reprocesses all files whenever there's an update.
