---
name: codelore-architecture-map
description: "Map codebase modules, layers, boundaries, dependencies, and data stores into a source-grounded diagram. Use for architecture overviews, coupling questions, and module graphs. Not for a symbol's callers or one execution scenario; use file exploration or tracing."
---

# Architecture map

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Fix the target revision and scope before drawing. Use `codelore-file-explorer` for symbol-level questions.

## When to use

Use for a repository or subsystem architecture overview, module boundaries, dependency direction, or a source-backed diagram. For the exact call path of one scenario use `codelore-execution-trace`; for isolated file questions use `codelore-file-explorer`.

## Inputs to gather

Identify the target revision, scope, intended audience, level of detail, relevant deployment docs, and whether the user wants a diagram or reusable edge list. Start with manifests and entry points rather than assuming the README describes the implementation.

## Workflow

1. Identify executable entry points, packages, modules, routes, background workers, persistence, external services, and build or deployment boundaries from manifests and source. Choose graph nodes at a scale that answers the user: packages for a monorepo, modules for a service, or components for a focused feature.
2. Establish edges from imports, calls, routing, configuration, or documented runtime contracts. Label each edge by relation and direction; record at least one `path:line` reference per material relation. Keep a separate list of inferred or dynamically resolved edges.
3. Draw a Mermaid flowchart or DOT graph small enough to read. Group by layer or package, avoid duplicate nodes, and explain the main request/data path in prose. If the graph is large, show a top-level map and a focused subgraph for the user's question. Include cycles, shared mutable state, and boundary crossings when found.
4. Compare the observed architecture with the declared design in docs. Call out drift only with both sides evidenced. Note where static inspection cannot establish deployment topology, runtime wiring, or traffic frequency.
5. If asked to produce a reusable graph artifact, use stable node IDs and an edge list with source references. Do not use arbitrary coordinates as evidence; layout is presentation only.

Return diagram, node legend, evidence table, important boundaries, and open questions. Do not fabricate a health score or represent a diagram as a live runtime trace.

## Boundary checks

- Distinguish source package boundaries from deployed processes. A folder named `service` is not proof of a separate service.
- Trace dependency direction through imports, runtime calls, events, configuration, or generated clients; label the relation on each edge.
- Identify trust and data boundaries: authentication, external APIs, persistence, queues, caches, and user-controlled inputs. Note which boundaries are inferred from config alone.
- Check the claimed layer rule against actual cross-layer imports. Report a violation only after reading both the rule or documented design and the contrary code.
- For large monorepos, choose a top-level graph plus one focused subgraph. Record the node and edge count and the collapsed or omitted areas.

## Guardrails and verification

Keep architecture analysis read-only unless an output artifact is requested. Do not run deployments or assume runtime traffic from static code. Verify each significant edge against a path and line at the selected revision, and check that the diagram's arrow direction matches the cited relation.

## Report

Return scope and revision, node legend, diagram, edge evidence table, principal request or data path, boundary and coupling observations, design drift with evidence from both sides, and unknown runtime topology. The `codelore_architect` agent can map a bounded subsystem; one agent can perform the same steps.

## Choosing map scale

1. For a multi-package repository, start with deployable units or workspaces and their declared dependencies. Do not place every file on the first diagram.
2. For a single service, show entry surfaces, domain modules, persistence, queues, external adapters, and shared infrastructure only when the code supports those distinctions.
3. For a focused feature, show the few components and modules that handle its path; link to the broader map instead of copying it.
4. When a package contains multiple unrelated concerns, split it only if the separate nodes clarify a real dependency or trust boundary.

## Edge evidence table

Use columns `source`, `relationship`, `destination`, `path:line`, and `status`. Status is `observed in source`, `observed at runtime`, `inferred`, or `unknown`. A configuration declaration may show an intended connection while runtime activation still depends on environment variables or deployment wiring. Note the distinction in the table.

## Architecture questions worth checking

- Which dependency directions are enforced by imports, package boundaries, or build rules, and which are only conventions in docs?
- Where does user-controlled data cross validation, authentication, authorization, persistence, or external-service boundaries?
- Which modules own state, and which share or mutate it across boundaries?
- Are cycles structural imports, runtime callbacks, event cycles, or only diagram layout loops?
- What deployment assumptions cannot be proven from this checkout, such as replicas, traffic routing, or managed service configuration?

## Optional delegation

The `codelore_architect` agent can map a bounded layer or package in parallel with other read-only specialists. It must send cited edges and unknowns back to the coordinator, who checks the combined diagram for conflicting node names and directions.
