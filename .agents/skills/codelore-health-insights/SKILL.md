---
name: codelore-health-insights
description: "Review repository architecture, correctness, security, performance, and maintainability with prioritized source-backed findings. Use for health summaries and risk recommendations. Not for package-only advisory audits; use dependency audit. Score only with a documented rubric."
---

# Health insights

Read [the shared evidence contract](../codelore-workflow/references/evidence.md). This skill turns the old dashboard's insight cards and category scores into a review that can be checked against source and tests.

## When to use

Use for a prioritized repository health review or evidence-based risk summary. For only package advisories use `codelore-dependency-audit`; for a particular call path use `codelore-execution-trace`.

## Inputs to gather

Fix revision, target paths, audience, risk tolerance if supplied, project test and review rules, available prior architecture/dependency findings, and whether a numerical score is requested. Read the default rubric only when scoring is in scope.

## Workflow

1. Fix the revision and review scope. Reuse architecture, dependency, and execution findings where available, but recheck source evidence for high-impact claims. Search for counterexamples before declaring a pattern repository-wide.
2. Review five categories: architecture (boundaries, coupling, cycles), code quality (correctness risks and tests), security (trust boundaries and concrete exposures), performance (measured bottlenecks or algorithmic risks), and maintainability (change surface, duplication, documentation). Skip a category when evidence is insufficient and say why.
3. For each finding give title, category, severity, affected paths and lines, impact, reproducible observation or reasoning, and a practical next step. Distinguish a proven defect from a hypothesis requiring a test. Verify dependencies with `codelore-dependency-audit` rather than inventing vulnerability counts.
4. Rank by likely impact and confidence, then effort. A high severity requires a plausible harmful path and supporting evidence. Do not mark a repository secure because a quick review found nothing.
5. If a user requests a 0–100 score, first use a supplied rubric. Otherwise use the [default scoring rubric](references/scoring.md) with its coverage gate and calculation. For a full Codelore review, try the default rubric, but leave categories or the overall score unscored when coverage is insufficient. Never copy the UI's demo score. Show the underlying observations next to every category score.

Return a short summary, prioritized findings, evidence and limits, and optionally a rubric-backed score table. Avoid broad statements such as “architecture accuracy” or performance percentages without measurement.

## Evidence thresholds

- A correctness defect needs a concrete path to incorrect behavior, a failing test, or a reproducible observation. A smell alone is a maintainability observation.
- A security finding needs an entry point, trust boundary, missing or ineffective control, and plausible effect. Do not infer exploitation from a matching keyword.
- A performance bottleneck needs a measurement or a defensible complexity argument with the input size that makes it matter. Label unmeasured risks as hypotheses.
- A repository-wide statement needs representative coverage across relevant packages; otherwise scope the claim to inspected files.
- A score needs the rubric's coverage gate, each underlying observation, and a calculation that can be repeated. Missing coverage stays unscored.

## Guardrails and verification

Keep this review read-only. Do not run unsafe project commands, expose secret values, or lower a category score based on absent evidence. Reopen each cited line before reporting, search for counterexamples to broad claims, and separate advisory facts from local reachability. Findings should include severity and confidence as distinct judgments.

## Report

Return scope and revision, coverage by category, prioritized findings with `path:line`, impact, confidence, and next action, plus tests or measurements actually run. Add category scores only when justified by the rubric. State unreviewed packages and unresolved hypotheses. The `codelore_health_reviewer` agent can review a bounded area read-only.

## Finding register

Use one row or section per material issue with `title`, `category`, `severity`, `confidence`, `affected path:line`, `observed behavior or risk mechanism`, `impact`, `counterevidence checked`, and `next action`. Severity expresses potential impact; confidence expresses how well the evidence supports this particular claim. Avoid turning a low-confidence hypothesis into a high-severity headline without its uncertainty visible.

## Review decisions

- For architecture, verify a boundary or dependency rule before labeling a crossing as a violation. Cycles may be intentional; explain their cost in the observed change path.
- For code quality, look for behavior at public seams and nearby tests. A missing test is a coverage concern only when the behavior or change risk justifies it.
- For security, trace untrusted input and identity through enforcement to the sensitive operation. Cite the missing check and plausible effect rather than naming a vulnerability category alone.
- For performance, prefer measured profiles, query plans, build output, or reproducible complexity examples. State workload assumptions when only source inspection is possible.
- For maintainability, quantify duplication or change surface where possible and show why it slows a realistic change. Large files alone are not proof of poor design.

## Score decision

Open `references/scoring.md` before using the default rubric. Check its coverage gate for each category and the overall score. Show the arithmetic and evidence alongside the result. If one major package or risk area is uninspected, explain why the aggregate score is withheld rather than filling the gap from intuition or the old UI fixture.

## Optional delegation

The `codelore_health_reviewer` agent can review a bounded package or category. The coordinator checks duplicates, incompatible severity judgments, and whether specialist coverage supports any repository-wide statement.
