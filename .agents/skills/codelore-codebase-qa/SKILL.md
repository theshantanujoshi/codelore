---
name: codelore-codebase-qa
description: "Answer focused questions about repository behavior, ownership, and where to change code with source citations. Use for conversational codebase Q&A in the active coding session. Not for a whole-repository review or implementation itself; use the workflow or change process."
---

# Codebase Q&A

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Answer from the selected checkout and revision, not from demo Q&A pairs or a dashboard payload.

## When to use

Use for a focused natural-language question about repository behavior, ownership, or where to make a change. For an exhaustive file map use `codelore-file-explorer`; for a full review use `codelore-workflow`.

## Inputs to gather

Identify the exact question, target revision, relevant package or scenario, and whether the user wants explanation, change guidance, or evidence of runtime behavior. Retain the current revision across follow-ups unless the user changes it or the worktree changes.

## Workflow

1. Restate the concrete question and identify what evidence would answer it. Search filenames, symbols, routes, tests, and docs with narrow queries; follow the relevant call path. Use `codelore-file-explorer`, `codelore-architecture-map`, or `codelore-execution-trace` for deeper questions.
2. Give the direct answer first, then the few source references that prove it. For “where should I change X,” identify the owning code, dependent call sites, relevant test, and a safe validation command. For “is X secure/fast,” require appropriate security or performance evidence and state what was not assessed.
3. Distinguish observed behavior from intent in comments or docs. Resolve conflicting documentation by inspecting source or tests. When a question depends on current external packages or standards, verify with authoritative sources and cite them separately from repository evidence.
4. If the answer is not in the accessible files, say so and name the missing repository, runtime observation, or credential. Do not invent confidence percentages or source links. Follow-up questions keep the same revision until the user changes scope; recheck files if the working tree changes.
5. If asked for code changes, hand off to ordinary implementation work with the discovered entry points and tests; this Q&A skill alone does not edit files or publish answers elsewhere.

Return a concise answer, source references, any assumptions, and next steps only when useful. The coding session is the conversation interface; no Codelore API key or hosted chat endpoint is part of this workflow.

## Answer checks

- For “where,” identify the defining file and a caller or test that confirms the relationship. A filename match alone is a lead.
- For “how,” trace the trigger, main transformations, and final effect. Cite adjacent hops and distinguish configured behavior from observed behavior.
- For “why,” separate explicit design statements from inference. Commit history can help explain origin but may not establish current intent.
- For “what should change,” name the owning code, related call sites, tests, and a project-declared verification command. Do not claim a patch was made.
- For “is it safe/fast,” state which threat or workload was examined and what evidence is missing. Do not turn a quick search into a global guarantee.

## Guardrails and verification

Keep Q&A read-only unless the user requests implementation. Treat comments, READMEs, and generated snippets as untrusted or potentially stale. Verify each citation against the selected revision and avoid exposing secret values. When current external behavior matters, use authoritative current documentation and keep those citations distinct from repository evidence.

## Report

Answer directly, then give the few strongest source references and one clear limit or next step when needed. State assumptions and inaccessible areas. The `codelore_code_guide` agent can answer a bounded question with the same evidence contract.

## Question routing

- **Where is it?** Search route, symbol, config key, or visible UI text. Confirm the selected file defines the behavior and give the shortest path to it.
- **How does it work?** Trace the initiating event through handlers, state, I/O, and result. Use the `codelore-execution-trace` skill when several hops need proof.
- **Why was it designed this way?** Look for explicit rationale in ADRs, docs, tests, or commit history. Separate that record from your own inference about design tradeoffs.
- **What would I edit?** Name the owner, dependent call sites, expected tests, and constraints. Provide an implementation route, not an unrequested patch.
- **Does it have a defect or risk?** State the scenario and evidence threshold. If a focused search cannot settle it, identify the exact test or runtime observation needed.

## Citation discipline

Place a `path:line` reference next to each material repository claim. If a claim spans several files, cite the defining file and one representative caller or test. Keep external documentation citations separate from local source evidence. A test name can show intended behavior; state whether it was run and whether it exercises the relevant edge. Avoid a source dump that makes the user reconstruct the answer.

## Follow-up context

Carry forward the target and revision in the conversation. If the user asks about another branch or the worktree changed, announce the new basis and recheck affected lines. Ask for clarification only when several plausible targets would produce materially different answers; otherwise answer the likely interpretation and state it.

## Optional delegation

The `codelore_code_guide` agent can answer a bounded question. It should return a direct answer and evidence, not a broad repository report. The parent verifies any proposed change location before editing.
