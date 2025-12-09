# @labd/intl-extractor

## 2.2.0

### Minor Changes

- f4a755a: add trusted packages provenance and minimum age of updated to 20160, update pnpm 10.4.1 -> 10.24.0

## 2.1.0

### Minor Changes

- 585f8c9: Support nested translation function keys

### Patch Changes

- f8148ae: Sort the output before writing to make it deterministic

## 2.0.1

### Patch Changes

- 7a0b827: Handle literals for `getTranslations()` call
- b101935: update dependencies

## 2.0.0

### Major Changes

- 9e5046e: Watch mode and updated workflows

  ## Watch mode

  This release adds watch mode using `@parcel/watcher` (optional dependency). Use `--watch` or `-w` cli flag to run.
  Note: This is a simple implementation that just reprocesses all files once there's an update.

  Breaking change: Only one input directory is allowed instead of multiple, this is so we do not have to run multiple watchers for each input directory.

  ## Other

  - Update to pnpm 10
  - Use corepack
  - Use unified release workflow for Lab Digital packages

## 1.1.0

### Minor Changes

- 910977f: Support for translation property accessors

  Adds support for extracting labels from property accessors (e.g. `t.rich()` or `t.html()`).

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
