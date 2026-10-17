---
name: codelore-repo-intake
description: "Establish a trustworthy source snapshot, revision, access mode, and measured inventory for Codelore analysis. Use before broad reviews or repository metrics and scope questions. Not for deep architecture or dependency risk analysis; use the matching specialist skill."
---

# Repository intake

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). This skill replaces the imagined paste-URL/clone/CLI analysis entry point with a coding-session workflow. It never assumes a hosted Codelore service or a provider API key.

## When to use

- Start a full review, compare revisions, or answer a repository metrics question.
- A specialist's target, revision, or inclusion rules are unclear.

## Inputs to gather

Identify the checkout or URL, access method, commit and branch, dirty and untracked files, desired inclusion of tests and generated code, requested depth, and whether project commands may run. Discover these from the session and repository before asking the user.

## Workflow

1. Identify the target and access mode: local checkout, accessible private checkout, or public URL. For a URL, use an already available repository connector or read-only checkout where permitted. Never ask for a personal access token in chat. If the repository is private and inaccessible, report the access limit rather than guessing from public metadata.
2. Record revision, branch, remotes if relevant, worktree cleanliness, and analysis timestamp. Ask whether the user wants only committed files or the working tree if this affects the answer; otherwise state that the current working tree is included. Do not alter the checkout during intake.
3. Enumerate source and test files with Git-aware listing when possible. Exclude `.git`, dependencies, build output, generated files, binaries, and secrets by default. Count files and text lines using a stated method; classify languages by extension or a verified language tool. For a huge tree, cap the displayed sample while keeping counts separate, and label both limits.
4. Locate manifests, lockfiles, entry points, configs, CI, docs, and tests. Return a compact tree with paths, language breakdown, and a map of likely subsystems. Do not infer architecture from names alone; defer that to `codelore-architecture-map`.
5. Capture requested settings explicitly: tests included or excluded, depth for dependency inspection, target scenario, output format, and whether execution of project commands is permitted. Pass these fields with the revision to the next specialist.

Result: identity and revision, access mode, measured metrics with units and method, file coverage, key entry points, and exclusions. If the host has no Git or network access, work from available files and mark counts partial. Refreshing a previously analyzed repository uses `codelore-refresh`.

## Inventory decisions

- Prefer Git-aware listing for tracked-file counts; use `rg --files` for quick navigation. Explain differences when ignored, untracked, sparse-checkout, or submodule files affect totals.
- Keep physical lines, nonblank lines, and code lines separate. Name the counting tool and method. Never infer an exact total from the shortened tree shown to the user.
- Classify source, tests, docs, configuration, and generated files separately when that distinction matters. Extension-based language counts are estimates for extensionless or mixed-language files.
- Treat manifest scripts and framework conventions as entry-point candidates until the source confirms them. Record declared test, lint, and build commands without implying they were run.
- Recheck the revision if the worktree changes during later analysis. Tell specialists which uncommitted files were included.

## Guardrails and verification

Do not run project scripts merely because a README recommends them. Do not inspect or print secret values. Avoid following symlinks outside the target checkout. Never reset, clean, stash, fetch, or modify the checkout as part of intake. Verify that the reported revision and scope match the files inspected, and that every named entry point exists in a cited file.

## Report

Return source identity, revision, worktree state, observation time, scope, inventory with method and units, manifests and likely entry points, declared commands, exclusions, and unresolved access or coverage gaps. If Git is unavailable, state the weaker revision identity instead of inventing a SHA. The `codelore_intake` agent may prepare this read-only handoff; a single agent can do the same work.

## Inventory pitfalls

- `git ls-files` counts tracked paths at the current index, not necessarily every file on disk. An untracked source file can be relevant to the working-tree snapshot even when absent from that count.
- `rg --files` follows ignore rules and may omit ignored source generated during setup. State the ignore policy before treating its output as complete.
- A monorepo may have several manifests, lockfiles, workspaces, or package managers. Identify the boundaries before aggregating counts or declaring one runtime version.
- Symlinks, submodules, sparse checkouts, and missing Git LFS objects can make a tree look complete when content is absent. List these limits explicitly.
- Binary or minified files make physical-line totals misleading. Exclude them with a stated rule, rather than reporting a large line count as source code.
- Tests can be source files in one classification and test files in another. Choose one primary bucket for totals; mention overlap rather than double-counting.

## Handoff shape

```text
Target and access mode:
Revision, branch, and observation time:
Working-tree status and inclusion:
Scope and exclusions:
Inventory: method, file categories, language method, line-count definition
Likely entry points and evidence:
Manifests, lockfiles, CI, tests, and docs:
Declared commands; commands actually run:
Unresolved access or coverage limits:
```

If the host lacks Git, use file paths and an observation time as the identity. If access is blocked, return a useful partial snapshot only for files actually visible. Never turn the absence of a manifest in a sampled view into a claim that the repository has none.
