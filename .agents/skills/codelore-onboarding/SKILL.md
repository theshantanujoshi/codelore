---
name: codelore-onboarding
description: "Produce a repository-specific contributor guide for prerequisites, setup, first run, tests, and first change from verified project files. Use when a new contributor needs repeatable onboarding. Not for a quick answer about one file or behavior; use codebase Q&A."
---

# Onboarding guide

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Target the user's OS, role, and desired first task when known; otherwise choose the project's documented development environment and state the assumption.

## When to use

Use for a contributor's path from checkout to a working local run, passing check, and first edit. For a quick structural answer use `codelore-codebase-qa`; for an architecture map use `codelore-architecture-map`.

## Inputs to gather

Discover README and contributor docs, manifests and lockfiles, runtime version pins, task runner, CI commands, example environment files, local services, and existing onboarding location. Ask about audience, OS, accounts, or credentials only if the answer changes the instructions.

## Workflow

1. Locate real prerequisites, package manager and lockfile, environment variable names, services, ports, database setup, seed data, build/test/lint commands, and entry points. Read manifests and config before relying on README claims. Never print secret values or suggest committing them.
2. Arrange steps in dependency order: obtain source/access, install prerequisites, configure local values, start services, verify health, run focused checks, and make a safe first edit. Each command must exist in scripts, make targets, docs, or verified tool help; label commands that require external services or credentials.
3. Run harmless checks when practical and authorized. If setup cannot be executed, mark commands **documented but unverified** and say what is missing. Distinguish a command that built here from one that should work after credentials are supplied.
4. Include a map of where to change a route/component, where tests live, how to debug a common failure, and how to reset only generated local state. Do not run destructive cleanup as part of producing the guide.
5. Offer a checklist so a reader can track progress. Completion ticks represent work actually performed by the user or agent, never preset demo progress. If asked to write a guide file, use the requested location and preserve existing documentation unless asked to replace it.

Return prerequisites, numbered commands with purpose and evidence, verification expected result, first-change path, and unresolved setup requirements.

## Guide structure and checks

1. State what the project does and where a newcomer should begin. Cite the defining entry points rather than repeating marketing text.
2. Give prerequisites with exact versions when pinned; otherwise state the supported range or that no version is declared. Identify required accounts by purpose without exposing secret values.
3. Sequence local setup, configuration, services, build, tests, and a focused first change. Distinguish a command found in docs from one verified in this session.
4. Name the key abstractions a contributor meets in the first edit, with source references. Link to existing docs for details they already explain correctly.
5. Record gotchas discovered from actual failed checks, platform differences, generated files, and CI-only steps. Do not invent common failures.

## Guardrails and verification

Run each safe project command separately only when authorized and practical. Do not run production migrations, deploys, or destructive reset steps to verify a guide. Check relative links and cited paths; mark every setup and test command verified with its result or unverified with a reason. Preserve existing docs unless the user asks for a replacement.

## Report

Return overview, prerequisites, numbered setup, source layout, key abstractions, first-change route, tests, gotchas, and outstanding access needs. Include a short verification table of command, status, and evidence. The `codelore_onboarder` agent can draft the bounded read-only analysis; writing a guide file follows the user's requested location.

## Setup evidence order

1. Use runtime pin files, package manager fields, lockfiles, and CI to establish versions and install mode.
2. Use project scripts or task-runner definitions for exact command spelling. A README command may be stale; check it against the current manifest.
3. Use example configuration and source reads to list environment variable names and purpose. Never put live values in the guide.
4. Use local run output to describe success only when the command was actually run. A declared health endpoint is not proof the service started here.
5. Use tests and nearby code to select a small first change that teaches the project's conventions without touching production systems.

## Verification table

```text
command | source of command | attempted here? | result or reason unverified
```

If a step requires credentials, database state, containers, or network access unavailable in the session, keep the documented sequence but mark the exact step unverified. Do not mark later dependent steps verified merely because they are plausible. Include platform-specific variants only when they are in project docs or verified tool help.

## Optional delegation

The `codelore_onboarder` agent can prepare the guide from a fixed checkout. A coordinator should recheck command results and `path:line` references before presenting the guide as verified, especially when an agent worked in a different environment.
