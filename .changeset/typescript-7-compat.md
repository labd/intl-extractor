---
"@labdigital/intl-extractor": minor
---

Use the `@typescript/typescript6` compatibility package for AST parsing instead of the consumer's `typescript` peer dependency. TypeScript 7.0 ships without the classic JavaScript API (`ts.createSourceFile`, `ts.ScriptTarget`, the `is*` node guards), so extraction broke when consumers upgraded. Bundling the stable TS 6.0 API decouples the extractor from the consumer's compiler version and drops the `typescript` peer dependency.
