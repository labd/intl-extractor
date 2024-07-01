# intl-extractor

Extracts `next-intl` labels from TypeScript files and merges them to a given output json file.

This automates away manually setting labels in a `source.json` file.

## How to use

```bash
npx @labdigital/intl-extractor -i ./path/to/files -o ./path/to/output.json
```

## How it works

Scans input files for `useTranslations` or `getTranslations` usage using the TypeScript SDK. It will then merge them all together and check the source JSON file for label values.
