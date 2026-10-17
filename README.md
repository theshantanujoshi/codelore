# Codelore

Codelore is a portable skill and agent suite for exploring a codebase. It can assemble a source-cited review of a repository or answer a focused question about its architecture, execution path, dependencies, health, and setup. It uses the active coding session's model access and repository permissions; it does not need a separate Codelore LLM API key.

The React/Vite app in this repository is the original visual prototype. Its repository analysis and chat screens expect API endpoints that this repository does not provide. Use the skill workflows for analysis. See [UI prototype status](docs/ui-prototype.md).

## Quick start

Open this repository in a supported coding harness, or [install the project skills and agents into another checkout](docs/harness-support.md). Make the repository you want to inspect accessible to that session, then ask:

```text
Use the codelore-workflow skill to review D:\path\to\target-repo at its current revision. Cover the file map, architecture, one execution trace, dependencies, health, and setup. Cite source files and state what you could not verify.
```

For a narrower task, use a specialist skill such as `codelore-codebase-qa` or `codelore-dependency-audit`. A result is returned in the coding session by default; ask for a file or diagram when you need one. [Using Codelore](docs/using-codelore.md) has more examples and scope guidance. Skill invocation syntax varies by harness; see [Harness support](docs/harness-support.md).

## Documentation

- [Using Codelore](docs/using-codelore.md) — choose a workflow and interpret its results.
- [Harness support](docs/harness-support.md) — discovery paths, agent profiles, and invocation examples.
- [Kit authoring](docs/kit-authoring.md) — canonical content rules, reference provenance, and validation.
- [How the project fits together](docs/architecture.md) — skill/agent roles, evidence flow, and boundaries.
- [Feature coverage](.agents/skills/codelore-workflow/references/feature-coverage.md) — all 11 skills and matching agents.
- [Evidence contract](.agents/skills/codelore-workflow/references/evidence.md) and [health score rubric](.agents/skills/codelore-health-insights/references/scoring.md) — output rules used by the suite.
- [UI prototype status](docs/ui-prototype.md) — local run commands and implemented versus advertised behavior.

## UI development

With Node.js and npm installed, run `npm install` and `npm run dev` to view the prototype. Run `npm run build` for a production bundle. These commands do not start an analysis backend. The repository has no `test` or `lint` package script. The install command has not been verified as part of this documentation update; the build command has.

No license file is present in this repository. Ask the repository owner before assuming reuse terms.
