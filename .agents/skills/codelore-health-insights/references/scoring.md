# Transparent health score rubric

Use this default only when a numerical score is requested or a full Codelore review calls for the original score view. A user-supplied rubric takes precedence. Scores describe the checked revision and stated scope, not the inherent quality or safety of a repository.

For each check record `2` for a verified healthy condition, `1` for mixed/partial evidence, `0` for a verified material gap, or `NA` when not assessed. Cite the observation and method. Do not award points merely because a search found no problem. Each category needs at least three of four checks assessed; otherwise show **unscored**. A category score is `round(100 × earned / (2 × assessed checks))`. An overall score is the rounded mean of all five category scores only when every category meets the coverage gate. Always show `assessed/4` and missing checks beside the number.

| Category | Four checks |
| --- | --- |
| Architecture | Entry points and module boundaries are identifiable; cross-layer dependencies follow intended direction; important cycles/shared state are controlled; external service and data boundaries are explicit. |
| Code quality | Critical paths have meaningful tests; static/type/build checks pass for the revision; error and edge paths are handled; implementation and tests agree on behavior. |
| Security | Trust boundaries/auth decisions are enforced; untrusted input is validated; secrets and sensitive output are handled safely; dependency advisories are checked with current data. |
| Performance | Likely hot paths have appropriate complexity; data access or rendering avoids obvious unbounded work; build/runtime measurement exists for key paths; identified bottlenecks have measurements or tests. |
| Maintainability | Setup and change instructions are accurate; ownership/module structure is understandable; dependency and configuration drift is controlled; the main change path has a reliable verification command. |

Report each check's short evidence and uncertainty. A `0` is a finding with a next action; `NA` is an open check. Never turn a missing runtime measurement into a passing performance check. If the repository is too large for representative coverage, report category scores only for a named subsystem or leave the overall score unscored.
