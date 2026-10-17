# Original Codelore feature coverage

The feature set is derived from the project's original concept. This suite turns its intended *analysis behavior* into coding-agent workflows.

| Original capability | Skill | Agent | Session result |
| --- | --- | --- | --- |
| Full codebase review across the original views | `codelore-workflow` | `codelore_coordinator` | Integrated review with revision, citations, limits, and specialist results |
| Public GitHub URL, private checkout, test repo, CLI/local scan, inclusion settings | `codelore-repo-intake` | `codelore_intake` | Scoped source inventory and measured repository metrics |
| File tree, imports/exports/callers, 3D exploration | `codelore-file-explorer` | `codelore_file_explorer` | Navigable tree, symbol map, optional graph data or interactive view |
| Module and layer architecture map | `codelore-architecture-map` | `codelore_architect` | Cited Mermaid/DOT graph and boundary notes |
| Request path, data flow, and analysis execution trace | `codelore-execution-trace` | `codelore_tracer` | Ordered, cited static or observed trace |
| Direct/transitive packages, advisories, licenses, outdated versions, size | `codelore-dependency-audit` | `codelore_dependency_auditor` | Evidence-backed package inventory and risk findings |
| Architecture, quality, security, performance, maintainability insights and scores | `codelore-health-insights` | `codelore_health_reviewer` | Prioritized findings; score only with an agreed rubric |
| Repository-specific setup guide | `codelore-onboarding` | `codelore_onboarder` | Verified setup and first-change guide |
| Ask questions about the codebase | `codelore-codebase-qa` | `codelore_code_guide` | Source-cited answers and implementation pointers |
| Reanalyze after new commits, export, notifications | `codelore-refresh` | `codelore_refresh_reviewer` | Revision diff, shareable report, optional scheduled run where supported |
| 3D file view, terminal-style trace, dashboards, animations, visual reports | `codelore-visual-report` | `codelore_visual_reporter` | Mermaid/DOT or an optional accessible interactive local artifact |

The primary coding session may assign specialist agents and use `codelore_coordinator` to assemble the result; the coordinator can also run the specialist skills in one thread. No Codelore-specific LLM key, hosted analysis API, or GitHub OAuth app is required. Private repositories rely on access already granted to the active coding session. An interactive 3D visualization requires an explicit export; the agent's default response is a navigable tree and diagram. Continuous monitoring and notifications require a scheduler and delivery channel supplied by the host environment; the skill must not claim they are running when they are not. Model choice, theme, and notification preferences belong to the host application or explicit task request.
