---
name: codelore-file-explorer
description: "Explore a repository's folders, files, symbols, imports, exports, callers, and bounded code graphs with source-backed navigation. Use for file explorer and symbol-location questions. Not for a full architecture map or one runtime scenario; use the matching specialist skill."
---

# File explorer

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Start from the target and revision supplied by `codelore-repo-intake`; if absent, establish them first.

## When to use

Use for a file map, symbol location, import/export question, caller search, or bounded graph of code relationships. For package layers and architectural boundaries use `codelore-architecture-map`; for one behavior from trigger to effect use `codelore-execution-trace`.

## Inputs to gather

Get the target revision, question, subtree or package, requested depth, and whether tests or generated files should appear. A vague request for exploration can begin with a compact overview; do not enumerate every source file without a reason.

## Workflow

1. Build a Git-aware tree for the requested subtree. Show directories and representative source files, with omitted counts when shortened. Search by path and symbol name before opening many files. Do not follow symlinks outside the target checkout or expand generated/vendor directories by default.
2. For a selected file, report purpose, language, size or line count only if measured, key exports, key imports, important call sites, and inbound references. Use syntax-aware tooling if already available; otherwise use targeted text searches and label unresolved dynamic imports, reflection, code generation, and aliases as limits. A matching identifier is a candidate caller, not proof of a call.
3. For a symbol question, follow its declaration to actual uses and report a short path through the code with `path:line` references. Include tests and docs that demonstrate behavior. Distinguish dependency edges from runtime call edges.
4. Describe complexity only when supported by a named measure or concrete evidence such as branching, size, cycles, or high coupling. Do not assign low/medium/high from intuition alone.
5. Default output is a navigable Markdown tree and a file detail table. When the user requests a graph or spatial exploration, produce a bounded node/edge representation with stable repo-relative IDs and distinct `contains`, `imports`, and `calls` edges. Offer Mermaid/DOT for small graphs; for an interactive 3D view, create a standalone artifact only when requested. State the node cap and omitted sections.

Check that every listed path exists at the analyzed revision and each highlighted edge has source evidence. Do not present a directory tree as a complete dependency graph.

## Navigation method

1. Search filenames and symbols first, then open the likely declarations and their surrounding code. Include re-exports, aliases, generated declarations, and framework conventions when they affect where an identifier resolves.
2. For an inbound-reference claim, inspect each candidate use in context. A text match may be a comment, test fixture, different symbol with the same name, or unreachable code. State the search area and unresolved dynamic dispatch.
3. Classify relationships precisely: a directory `contains` a file; a module `imports` another; a function `calls` another; a test `covers` a behavior. Do not turn an import into a runtime call without evidence.
4. For a graph, retain stable repo-relative IDs and cite an implementation site for every important edge. Collapse repetitive files into a labeled group and state what was omitted.

## Guardrails and verification

Navigation is read-only. Do not execute project code, install parser tools, or traverse secret and vendor trees by default. Verify each displayed path and line. If a language server or index is available, its result is a lead to check in source, not final proof. Label measured size and complexity with tool, unit, and scope.

## Report

Return the revision and search scope; a short tree or route to the requested symbol; a file detail table with purpose, exports, imports, and actual uses; evidence-backed relationship edges; relevant tests; and unresolved dynamic or generated links. A graph is optional when it improves the answer. The `codelore_file_explorer` agent may perform this bounded read-only search.

## Questions to resolve during navigation

- Is the selected file hand-written, generated, vendored, or a compiled artifact? Prefer the source of truth and tell the reader if edits regenerate it.
- Does a symbol name identify one declaration or several overloads, platform variants, or duplicate names in different packages? Resolve the exact import path.
- Is an export public to package consumers or only re-exported within a folder? Check package entry points and visibility rules before calling it public API.
- Is a caller direct, indirect through a registry, or only a test? Keep those categories separate.
- Does a framework discover the file by path or naming convention? Cite the convention from project configuration or current framework documentation when it materially affects the answer.
- Are there cycles, aliases, or path mappings that change which module an import resolves to? Check workspace and compiler configuration.

## Compact output shapes

For a file detail, use columns such as `path`, `purpose`, `exports`, `imports`, `called by`, `tests`, and `limit`. Keep long symbol lists out of the first answer. For a graph, provide an edge list before drawing:

```text
source node | relation | target node | source evidence | confidence or limit
```

Use a short tree for directory orientation and a call chain for behavior questions. If an edge is dynamic, show it as unresolved or inferred rather than drawing it as a verified call. Include the query or method used to establish coverage when a user asks whether all callers were found.

## Optional delegation

The `codelore_file_explorer` agent can answer a bounded file or symbol question in parallel with independent analysis. Its result must include the search scope so the coordinator does not mistake a local caller list for a repository-wide list.
