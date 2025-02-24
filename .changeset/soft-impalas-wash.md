---
"@labdigital/intl-extractor": major
---

## Watch mode

This release adds watch mode using `@parcel/watcher` (optional dependency). Use `--watch` or `-w` cli flag to run.
Note: This is a simple implementation that just reprocesses all files once there's an update.

Breaking change: Only one input directory is allowed instead of multiple, this is so we do not have to run multiple watchers for each input directory.


## Other

- Update to pnpm 10
- Use corepack
- Use unified release workflow for Lab Digital packages
