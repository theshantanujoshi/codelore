---
name: codelore-refresh
description: "Compare source-backed Codelore findings across repository revisions and produce a change digest or requested export. Use after commits or when asked to refresh an earlier review. Not for a first-time baseline review; use the full workflow."
---

# Refresh and export

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). This skill replaces the old UI's reanalyze, export, auto-refresh, and notification controls with explicit session work.

## When to use

Use to compare an earlier Codelore review or repository revision with a newer one, produce a change digest, or export requested findings. For a first-time review without a baseline use `codelore-workflow`.

## Inputs to gather

Identify the prior report or its scope, old and new revisions, changed paths, worktree inclusion, output format, and requested destination. If the prior report lacks a revision or evidence method, treat its claims as unverified until checked.

## Workflow

1. Identify the prior and current revisions, prior report if any, and changed paths. If there is no prior report, do a fresh scoped review and label it as a baseline. Do not silently fetch or switch branches; use the checkout's current state unless the user requested a revision change.
2. Re-run intake for changed source and manifests. Route affected sections to relevant specialist skills. Reuse unaffected findings only when their source references and assumptions still hold at the new revision. Revalidate advisory status with current data if reporting dependency risk.
3. Classify findings as new, resolved, changed, or unchanged, with evidence from both revisions. A missing finding is not resolved until the relevant code path or check was inspected. Include a short change digest and updated open questions.
4. Provide the result in chat by default. On request, export Markdown and optional Mermaid/DOT or structured JSON to user-selected paths. Include revision, timestamp, scope, evidence links, limits, and a schema/version field for machine-readable output. Do not make the browser dashboard artifact from the previous implementation the default contract.
5. For automatic reanalysis or notifications, check whether the current host offers a scheduler and delivery channel. Propose the exact trigger, cadence, destination, and failure behavior; configure them only when requested and authorized. If the host has no such capability, say manual refresh is available. Do not imply background monitoring is active.

Stop after the requested revision comparison and export. Do not loop on new commits or send messages to others without explicit authorization.

## Comparison checks

1. Match findings by stable subject and behavior, not display order or wording. Retain old and new source references and explain why classification changed.
2. Reinspect the code or scanner result that supported an old finding before calling it resolved. A disappeared warning may reflect a skipped scan or scope change.
3. Recalculate metrics with the same method and inclusion rules. If the method changed, show both and avoid presenting the difference as repository growth or shrinkage.
4. For dependencies, current advisory data can alter a finding even without a code change; record both source revision and advisory observation date.
5. Validate exported links and schema fields against the new report. An export is a snapshot, not a live monitor.

## Guardrails and verification

Do not silently fetch, switch branches, schedule jobs, send notifications, or write exports. Respect existing worktree changes. Verify the old and new revision identifiers and the path basis for each new, changed, resolved, or unchanged claim.

## Report

Return revisions and observation dates, comparable scope, concise change digest, finding classification with evidence from both sides, new gaps, and exports actually written. For requested automation, describe trigger, cadence, destination, permissions, and failure handling before configuring it. The `codelore_refresh_reviewer` agent can perform a bounded read-only comparison.

## Classification rules

- **New:** the behavior or risk is present at the new revision and absent from the comparable old scope, with evidence for both sides.
- **Resolved:** the old issue's relevant path or check was reexamined and the harmful behavior is gone. A missing scanner result or moved file alone is insufficient.
- **Changed:** the same subject remains but impact, path, evidence, or priority differs. Explain the reason rather than creating a duplicate new finding.
- **Unchanged:** the old evidence remains valid at the new revision and relevant assumptions still hold. Recheck the underlying source even if the file was not in the simple changed-path list when generated code or shared config could affect it.
- **Unknown:** scope, access, scanner, or method differs enough that a comparison cannot be made reliably. Do not force it into one of the four change classes.

## Comparable metrics

Show the old and new values, unit, counting method, and inclusion rules together. If one run counted tracked files and another included untracked files, present them as separate snapshots, not as a growth figure. For a dependency finding, include the source revision and advisory observation date; either may explain a changed result.

## Export checks

For Markdown, check relative links and revision labels. For diagrams, confirm node IDs and edge citations still match the new report. For structured JSON, include an explicit schema version, target identity, revision, observation time, scope, findings, and limits. Export only to the requested or clearly authorized path and inspect the produced file before reporting success.

## Optional delegation

The `codelore_refresh_reviewer` agent can compare a bounded feature or finding set. Give it the prior report and both revisions; the coordinator reconciles cross-feature changes and checks that all classifications use the same scope.
