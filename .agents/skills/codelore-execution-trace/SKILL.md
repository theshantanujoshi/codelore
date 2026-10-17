---
name: codelore-execution-trace
description: "Trace one repository request, command, event, or UI action from trigger through state, data, and external boundaries to the result. Use for execution-flow and data-movement questions. Not for a static module map; use the architecture skill."
---

# Execution trace

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Ask for a scenario only when the repository has several plausible flows and the user has not indicated one; otherwise choose a representative path and name it.

## When to use

Use when the user asks how a request, command, event, scheduled job, or UI action reaches an effect. For static modules and layering use `codelore-architecture-map`; for a symbol's callers use `codelore-file-explorer`.

## Inputs to gather

Fix the revision, scenario, starting trigger, expected result, relevant environment or feature flag, and permission to run a focused test. If the scenario is unspecified, choose a representative path and clearly identify it.

## Workflow

1. Locate the initiating route, command, event handler, or UI action. Follow the calls, data transformations, validation, state changes, I/O, and response/render path. Use `codelore-architecture-map` to orient package boundaries, then inspect the exact implementation and tests.
2. Build an ordered trace. Each step needs component/function, input and output or side effect, `path:line` evidence, and failure/branch conditions. Mark asynchronous boundaries, queues, caches, retries, and authorization checks where present. Separate static possibilities from a path proven by a test or runtime observation.
3. If execution is authorized and practical, run a narrow test or instrumented command to confirm the critical path. Capture exact command and result. Do not infer timing from source or add made-up durations. If runtime validation is not possible, title the result **static trace**.
4. Offer a sequence diagram for a compact flow. For a long flow, present the principal route and separately list branches and unresolved dynamic dispatch. Trace both the happy path and one material failure path when relevant.
5. For analysis-pipeline questions, show the actual tools and files inspected in this session. Explain any scope pruning or skipped files from the real run; never simulate model calls, cloning, context windows, progress percentages, or terminal logs.

Return scenario, revision, ordered steps, diagram when useful, evidence, observed/static status, and gaps. Each step must be connected to the next by a demonstrated call, event, or data handoff.

## Trace checks

1. Distinguish registration from invocation: a route declaration, handler definition, or event subscription alone does not prove the path executes for the scenario.
2. Follow parameters and transformed data across each hop. Record validation, authorization, transaction boundaries, state writes, external calls, errors, and return values where they affect the outcome.
3. At an asynchronous handoff, identify producer, message or event shape, consumer, retry or deduplication behavior, and what cannot be followed in this checkout.
4. For branches, name the condition and show only the path selected by the scenario. Summarize alternate and failure paths separately, with citations.
5. If a test or runtime command is run, compare its observed result to the static trace. A passing test supports only the behavior it exercises; state mocked edges and uncovered steps.

## Guardrails and verification

Do not execute production jobs, send requests to live services, or run migrations merely to confirm a flow. Use the project's existing focused tests when safe and authorized. Check every adjacent pair in the trace for a demonstrated call, event, or data handoff. Mark missing edges as unresolved instead of drawing a continuous arrow.

## Report

Return scenario, revision, static or observed status, numbered steps with `path:line` evidence and input/output, one material failure branch, optional sequence diagram, tests run and their result, and unresolved dynamic or external boundaries. The `codelore_tracer` agent can trace a bounded path read-only.

## Step table

Build the trace before drawing a diagram. Use one row per meaningful transition:

```text
step | component or function | input and condition | output or side effect | path:line | evidence type
```

Evidence type should identify source inspection, test observation, runtime observation, or inference. A trace can combine these types, but the title must not imply the whole path was observed when only one test branch ran.

## Branch and boundary decisions

- If a feature flag or configuration selects between implementations, state the value assumed and where it comes from. Trace only the selected branch in the principal path.
- If dependency injection chooses an implementation at startup, find the binding. A method name alone does not prove which implementation runs.
- If an event or queue crosses a process boundary, identify the payload shape, producer, consumer, and evidence for their connection. Treat an unlocated consumer as a gap.
- If external code or a remote service handles the next step, stop at the outbound call and name what the repository cannot prove.
- If the failure path is caught and retried, record retry bounds and idempotency only when source or tests show them. Do not assume generic framework behavior.
- If source and tests disagree, describe the mismatch and check whether mocks, environment settings, or stale tests explain it.

## Optional delegation

The `codelore_tracer` agent can trace a single named scenario. Its result must not silently combine alternative branches into one impossible path. The coordinator may merge several separately labeled traces when the user asks for a larger flow map.
