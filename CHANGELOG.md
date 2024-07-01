# @labd/intl-extractor

## 1.0.0

### Major Changes

- 49b4b35: Output labels to a single json file

  ## What changed

  Instead of creating individual `<File>.labels.json` files for each TypeScript file it will now output a single JSON file containing all the namespaces and labels.
  It conforms to how `next-intl` works and removes the inbetween step since we can automate with this tool.

  Next to this the argument for passing directories has changed from `--source` to `--input` as it's confusing with `source.json` otherwise.

  ## Why

  Individual `*.labels.json` files were helpful to colocate labels and merge them to the single required JSON file. But now that we have this extractor we can just check all usages of `useTranslations` and `getTranslations` and merge them directly.

  Also the original implementation took file names as input instead of the used namespaces which led to unused labels and no support for multiple namespaces in one file.

  ## How to update

  1. Make sure your output JSON file is completely up to date
  2. Update the extractor
  3. Use `--input` instead of `--source` for input files
  4. Run extractor
  5. Remove all `*.labels.json` files from your project :)

## 0.0.2

### Patch Changes

- a850cca: Handle nested scopes better

## 0.0.1

### Patch Changes

- 64f7ae1: Initial release
- 2dbb51e: Handle `getTranslations` properly
