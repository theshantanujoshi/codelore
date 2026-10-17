---
name: codelore-visual-report
description: "Present verified Codelore findings as diagrams, navigable file maps, trace timelines, tables, or an optional interactive local report. Use for visual or shareable output requests. Not for gathering architecture or health facts; use the relevant analysis skill first."
---

# Visual report

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). This skill presents verified findings from other skills; it does not create architectural claims from visual layout.

## When to use

Use when a source-backed review would benefit from an architecture diagram, file tree, trace timeline, dependency table, or interactive artifact. For gathering the underlying facts first use the matching specialist or `codelore-workflow`.

## Inputs to gather

Get the report's target and revision, cited findings, audience, required sections, preferred format, output location, and privacy constraints. Choose a compact inline diagram for small answers and a standalone artifact only for a requested shareable result.

## Workflow

1. Confirm target revision, audience, required sections, preferred format, and export location. For a short answer, use Markdown tables and Mermaid. For a shareable artifact, choose a standalone HTML report or static files in a user-selected directory. Do not write into source directories without authorization.
2. Convert the verified file inventory into a navigable tree. For a graph, preserve stable repo-relative node IDs and label edge kinds: containment, import, call, and runtime handoff. Keep large graphs usable through grouping, filtering, search, and an explicit node cap. A 3D view should include a two-dimensional list/tree fallback and reduced-motion behavior.
3. Show architecture and execution with distinct diagrams. A module diagram represents static relationships; a trace timeline represents one named scenario. Label static versus runtime-observed traces. Terminal-style progress may replay **actual** completed steps and command results from this run, never simulated model processing, fabricated duration, or fake context-pruning events.
4. Present dependency and health findings as tables with units, observation dates, severity source, and links to evidence. Render score cards only when a rubric-backed score exists; otherwise use measured metrics and prioritized findings. Include onboarding steps and Q&A examples only when sourced.
5. Check accessibility and usability: text alternatives to spatial views, keyboard navigation for controls, visible focus, sufficient contrast, and readable output without animation. Avoid embedding private source snippets or secrets in portable files; tell the user when filenames or findings expose private structure.

Verify that links, paths, diagram node IDs, and any local interaction work before delivering. The artifact is a presentation of cited analysis, not proof that the repository was scanned or continuously monitored.

## Presentation checks

- Keep a source reference with each material node, edge, metric, and finding. A coordinate or color is only a visual encoding.
- Separate containment, import, call, and runtime handoff edges. Give distinct legends and avoid arrows whose direction is ambiguous.
- Show the revision, observation date, scope, sampling cap, and omitted areas near the visual itself, so an exported artifact remains interpretable.
- Provide text equivalents for diagrams and 3D views. Keyboard controls, reduced motion, visible focus, and readable contrast are part of completion for interactive output.
- Check the generated artifact in its intended viewer when available; for a static export, inspect links, labels, and representative rendering.

## Guardrails and verification

Do not embed private code snippets or secrets in portable HTML without explicit need and review. Do not create a file when an inline visualization meets the request. Never show demo metrics or simulated progress as current analysis. Confirm that every displayed score has the health rubric and observations behind it.

## Report

Return the visual or artifact location, target revision, input findings, format, interaction and accessibility checks, evidence links, and omitted areas. The `codelore_visual_reporter` agent can render a bounded verified result; it must not invent findings to fill a layout.

## Choosing a representation

- Use a compact Markdown table for a small inventory, finding comparison, or dependency summary.
- Use Mermaid or DOT for a small static architecture map with labeled edge types and a short legend.
- Use an ordered list or sequence diagram for one named execution path; show alternative branches separately.
- Use a navigable tree for file exploration, with search or grouping only when the file count warrants it.
- Use interactive 3D only when spatial exploration is explicitly useful and the user requested an artifact. Always include an equivalent searchable 2D view.

## Data contract for visuals

Keep target, revision, scope, observation time, source IDs, relation types, citations, and omissions with the exported data. Node IDs must be stable repo-relative identifiers; display names can be shortened separately. A finding card needs its severity source or rubric, observation method, and affected paths. Do not turn an inferred edge into a solid verified arrow.

## Artifact checks

Inspect the intended output at a representative viewport when a renderer is available. Check that links open, labels remain legible, long names do not hide evidence, keyboard users can reach controls, motion can be reduced, and a text fallback contains the same material facts. If the artifact includes private repository structure, tell the user before sharing it outside the session.

## Optional delegation

The `codelore_visual_reporter` agent may render verified findings while the coordinator continues analysis. It receives a bounded data handoff, never a request to fabricate missing metrics. The coordinator reviews the final artifact against the source findings before delivery.
