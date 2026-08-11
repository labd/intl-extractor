---
"@labdigital/intl-extractor": minor
---

Expose the extractor as a library, not just a CLI.

- Declare an `exports` map, so `@labdigital/intl-extractor` can be imported. `dist/index.js` was already built and shipped; nothing referenced it.
- Add `buildLabels({ input, source, fallback, onFile })`, which returns the label tree without touching the output file. `processFiles` becomes the read-merge-write wrapper around it.
- Add a `fallback` option for labels with no value in the source. It receives the full key path and defaults to the label name, so existing behaviour is unchanged.

Two fixes while in there: `processFiles` did not `await` its write, and its "no existing source file" branch was unreachable because the read threw first.
