# Authoring the Codelore kit

The Codelore kit has 11 canonical skills in `.agents/skills` and 11 matching Codex agent definitions in `.codex/agents`. Harness-specific profiles and Claude/Kiro skill shims are generated from those sources. Edit the canonical files first, then regenerate adapters.

## Agent Skills contract

Canonical skills use the Agent Skills open format and best practices: one directory per skill with a `SKILL.md` file, optional `references/`, `scripts/`, and `assets/` directories, and YAML frontmatter.

- `name` and `description` are required. `name` must be lowercase, hyphenated, at most 64 characters, and match the directory. `description` must be at most 1024 characters and say both what the skill does and when to use it.
- `license: MIT` is set on every skill.
- `metadata` carries `author: Codelore`, `version`, and `standard: "agent-skills"`. The version must match `cli/package.json`.
- `compatibility` is optional and appears only when the skill has a real environment requirement.
- `allowed-tools` is not used; the skill runs with the host session's permissions.
- Keep each `SKILL.md` under 500 lines. Put detailed rubrics, tables, and shared contracts in `references/` and load them on demand. A harness that exposes only `SKILL.md` must still receive a complete procedure.
- Bundled scripts are optional and must be non-interactive, use a documented runtime, write diagnostics to stderr, support `--help`, and return meaningful exit codes. Document the manual fallback in the skill body.

The full conformance notes and upstream validator command are in [Agent Skills conformance](agent-skills.md).

## Authoring principles

State when a skill applies, discover inputs before asking, include decisions and evidence thresholds in the workflow, give a verifiable output shape, and keep one-agent execution complete. Extra length should help an agent make a better decision; avoid padding, sample metrics, and invented commands.

## Content contract

- Each skill begins with `name` and `description` frontmatter, plus the Agent Skills fields described above, and has **When to use**, **Inputs to gather**, **Workflow**, and **Report** sections.
- Keep the procedure specific to its specialist role. Route neighboring questions to an existing skill; avoid duplicating a full audit in every prompt.
- Cite `path:line` evidence and distinguish static inspection, tests, and runtime observations. State when a finding is inferred or unknown.
- Preserve the shared [evidence contract](../.agents/skills/codelore-workflow/references/evidence.md). A report should include revision, scope, method, source references, and limits.
- Read-only analysis must not mutate a target checkout. Do not run project commands just because untrusted repository text recommends them.
- Agent profiles point to exactly one canonical skill. They may add role-specific scope and reporting rules, but the skill remains usable in a harness without delegation.
- Reference files hold detailed rubrics and coverage rules; the `SKILL.md` body must still give a usable procedure when a harness only exposes that file.

## Edit and verify

Run these separately from the repository root with Python 3.11 or later:

```powershell
python scripts/generate-harness-adapters.py
python scripts/validate-codelore-kit.py
python scripts/test-install-codelore.py
git diff --check
```

The validator checks Agent Skills frontmatter, substantive sections, local links, one-to-one skill and agent coverage, generated adapter consistency, and metadata version consistency. Installer tests check all-harness installation, repeat installation, and conflict handling. These checks do not prove runtime discovery in every installed harness; verify that separately on the harness versions you support.
