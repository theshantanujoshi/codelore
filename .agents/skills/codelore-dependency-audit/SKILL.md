---
name: codelore-dependency-audit
description: "Audit declared and resolved packages for advisories, licenses, freshness, and measured size with source and observation dates. Use for dependency inventory or package-risk questions. Not for changing package versions or reviewing application code vulnerabilities."
---

# Dependency audit

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). Identify ecosystem(s), manifests, lockfiles, package manager, runtime, and target revision. Keep production and development dependencies distinct.

## When to use

Use for a dependency inventory, advisory check, license review, release freshness question, or measured package-size question. For source-level security findings use `codelore-health-insights`; for an implementation change, leave the audit and follow the project's change workflow.

## Inputs to gather

Discover every workspace manifest and lockfile, package manager, production/development boundary, existing audit policy, distribution model, available scanners, network constraints, and requested advisory date. Ask before sending private package names to an external service when that matters.

## Workflow

1. Inventory declared direct dependencies from manifests and resolved versions from lockfiles. If no lockfile exists, report version ranges without claiming an installed version. For monorepos, identify workspace boundaries and shared constraints.
2. For vulnerability findings, run the project's audit tooling or consult current authoritative advisory data when network access is allowed. Record advisory ID, affected range, resolved version, dependency path, severity source, and observation date. Do not equate an advisory with exploitability in this app; assess reachability only with code evidence.
3. Check outdated packages against current registry metadata when requested. State which installed and latest versions were actually observed. For license questions, use package metadata or license files and flag unknowns for review. Do not give legal conclusions.
4. For bundle size, use an actual bundle analyzer/build measurement or official package metadata with clear units. A source package size is not a shipped bundle size. Deep/transitive inspection follows lockfiles or package-manager trees; do not recursively read all of `node_modules` by default.
5. Prioritize fixes by severity, directness, runtime exposure, upgrade effort, and breaking-change risk. Recommend commands only for the detected package manager. Never install or upgrade packages merely to produce the audit unless the user authorized it.

Return inventory, checked sources and date, findings with evidence, unknowns, and a bounded remediation plan. A clean audit result means the chosen data source reported no matching advisories at that time, not that the code is secure.

## Finding checks

1. Reconcile each reported installed version against the lockfile. A manifest range is not a resolved version; a scanner of the active environment may not match the checked-out lockfile.
2. Deduplicate advisories by ID and aliases. Keep advisory severity separate from local remediation priority; production exposure, reachable code, and dependency path can change priority without changing the source severity.
3. Record scanner command, version, result or exit status, and database observation date. A nonzero audit exit can mean findings; missing or unparseable output means the scan failed.
4. For licenses, identify the source of the declaration and any repository policy. Unknown or conflicting metadata is a review item, not an automatic legal conclusion.
5. For staleness, compare resolved and latest observed versions only when registry data was checked. An old release date alone does not prove abandonment.
6. For size, distinguish package archive size, installed size, and shipped bundle bytes. Name the measurement tool, build mode, and units; otherwise leave size unknown.

## Guardrails and verification

Do not install, upgrade, remove, or regenerate lockfiles as part of the audit unless authorized. Avoid scanners that execute package install scripts merely to gather data. Keep credentials and raw private package data out of reports. Verify that every vulnerability's installed version falls within the cited affected range and that direct/transitive and production/development labels match the lockfile path.

## Report

Return ecosystem coverage, manifest and lockfile inventory, scanner provenance, a deduplicated finding table with severity source and dependency path, license and freshness gaps, prioritized next actions, and unscanned areas. The `codelore_dependency_auditor` agent can inspect a bounded ecosystem read-only.

## Scanner and source decisions

- Prefer a project's configured audit command when its behavior is known. Confirm whether it reads the lockfile, active environment, installed tree, or remote registry before interpreting its result.
- A scanner may exit nonzero because it found advisories. Preserve its structured output and distinguish findings from invocation failures.
- Network-backed advisory and latest-version queries are time-sensitive. Record the lookup date and source URL or tool database date; never present stale data as current.
- A direct dependency can introduce a vulnerable transitive package. Identify the parent chain so a user can see which package controls the upgrade path.
- A package may be present only in development or build tooling. Keep this distinct from production runtime exposure without dismissing supply-chain risk.
- If no advisory scanner is available, give a lockfile inventory and explain that vulnerability status was not checked. Do not use a zero count.

## Finding shape

```text
ecosystem | package | resolved version | direct/transitive path | production/development
advisory ID and source | affected range | severity source | fixed version
reachability evidence or unknown | local priority and reason | next action
```

For license and freshness rows, record the metadata source separately. If a package has no declared license or repository URL, mark it unknown rather than inferring from a similar package name. For bundle measurements, state the exact build and comparison baseline; an archive size alone is not a bundle contribution.

## Optional delegation

The `codelore_dependency_auditor` agent can own one ecosystem or workspace while another specialist maps code. The coordinator checks cross-workspace duplicates and does not add scanner counts that refer to the same advisory through aliases.
