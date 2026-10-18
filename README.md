# Codelore

[![npm version](https://img.shields.io/npm/v/codelore-agent-suite)](https://www.npmjs.com/package/codelore-agent-suite) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## About

Codelore is a portable skill and agent suite for exploring a codebase. It can assemble a source-cited review of a repository or answer a focused question about its architecture, execution path, dependencies, health, and setup. The CLI installs the skills and agent profiles into a local checkout. Codelore uses the active coding session's model access and repository permissions; it does not need a separate Codelore LLM API key.

## Quick start

Open the repository you want to inspect in a supported coding harness. From that checkout, install Codelore's skills and agent profiles with Node.js 20 or later:

```powershell
npx codelore-agent-suite
```

You can also run `npx codelore-agent-suite init D:\path\to\target-repo` from another directory. See [Harness support](docs/harness-support.md) for options and [the CLI package](cli/README.md) for source and release details. Give your coding session access to the target checkout, then ask:

```text
Use the codelore-workflow skill to review D:\path\to\target-repo at its current revision. Cover the file map, architecture, one execution trace, dependencies, health, and setup. Cite source files and state what you could not verify.
```

For a narrower task, use a specialist skill such as `codelore-codebase-qa` or `codelore-dependency-audit`. A result is returned in the coding session by default; ask for a file or diagram when you need one. [Using Codelore](docs/using-codelore.md) has more examples and scope guidance. Skill invocation syntax varies by harness; see [Harness support](docs/harness-support.md).

## What is included

- 11 skills for repository intake, file exploration, architecture mapping, execution tracing, dependency auditing, codebase Q&A, health insights, onboarding, visual reports, review refreshes, and the full workflow.
- 11 matching agent profiles for Codex, with generated profiles for Claude Code, Cursor, Gemini CLI, GitHub Copilot, OpenCode, and Kiro. Other supported harnesses can use the portable skills; see [Harness support](docs/harness-support.md).
- A conflict-safe CLI that installs the skills and selected profiles into an existing checkout. It skips matching files and stops before changing any files if a selected destination differs.

## Documentation

- [Using Codelore](docs/using-codelore.md) — choose a workflow and interpret its results.
- [Harness support](docs/harness-support.md) — discovery paths, agent profiles, and invocation examples.
- [Kit authoring](docs/kit-authoring.md) — canonical content rules, reference provenance, and validation.
- [How the project fits together](docs/architecture.md) — skill/agent roles, evidence flow, and boundaries.
- [Feature coverage](.agents/skills/codelore-workflow/references/feature-coverage.md) — all 11 skills and matching agents.
- [Evidence contract](.agents/skills/codelore-workflow/references/evidence.md) and [health score rubric](.agents/skills/codelore-health-insights/references/scoring.md) — output rules used by the suite.

## Contribute and get help

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring workflow and local checks. Use [GitHub Issues](https://github.com/theshantanujoshi/codelore/issues) for bugs and feature requests.

## License

Codelore is available under the [MIT License](LICENSE).
