# Agent Skills conformance

Codelore uses the Agent Skills open format for its 11 canonical skills. A skill is a directory containing a `SKILL.md` file with YAML frontmatter, plus optional `references/`, `scripts/`, and `assets/` directories. Codelore stores the canonical skills under `.agents/skills`; harnesses that discover that path can load them without conversion.

## Frontmatter

Every canonical `SKILL.md` starts with the required fields and the project's optional fields:

```yaml
---
name: codelore-repo-intake
description: "Establish a trustworthy source snapshot..."
license: MIT
compatibility: "Python 3.11+ is optional for scripts/inventory.py..."
metadata:
  author: Codelore
  version: "0.2.0"
  standard: "agent-skills"
---
```

- `name` is lowercase, hyphenated, at most 64 characters, and matches its directory.
- `description` states what the skill does and when to use it, at most 1024 characters.
- `license` is `MIT`, matching the repository.
- `compatibility` appears only where a skill has a meaningful environment requirement. Most skills omit it.
- `metadata` carries `author`, `version`, and `standard`. The version matches `cli/package.json` so a released package identifies its skill revision.

`allowed-tools` is intentionally not used. Codelore runs with the host session's permissions and should not narrow or widen them through skill metadata.

## Progressive disclosure

The suite is structured for the format's three loading levels:

1. Harnesses load each skill's `name` and `description` to decide whether it applies.
2. The full `SKILL.md` body is loaded when the skill is activated. Each canonical `SKILL.md` stays under 500 lines and remains a complete procedure.
3. References, scripts, and other bundled files are opened only when the task needs them. For example, `codelore-health-insights` keeps its scoring rubric in `references/scoring.md`, and `codelore-repo-intake` can run its inventory script instead of loading a longer manual procedure.

Reference links are relative to the skill directory, and the canonical body remains usable when a harness exposes only `SKILL.md`.

## Bundled script

`codelore-repo-intake` includes a read-only inventory script:

```powershell
python .agents/skills/codelore-repo-intake/scripts/inventory.py --path D:\path\to\target-repo --format json
```

The script is optional. It uses only the Python 3.11 standard library, writes JSON by default, supports `--format text`, `--no-git`, `--max-files`, and `--max-file-bytes`, and never follows symlinks or reads likely secret files. Its output records the revision, counting method, categories, languages, manifests, entry-point candidates, exclusions, and limits. The skill body describes the same manual method when the script or Python is unavailable.

Scripts in a skill must be non-interactive, document dependencies, write diagnostics to stderr, and return meaningful exit codes.

## Generated harness shims

Claude Code and Kiro use generated `SKILL.md` shims under `.claude/skills` and `.kiro/skills`. Each shim copies the canonical frontmatter, so it is also a valid Agent Skills document, then points the agent at the canonical file and its relative references. The shims are regenerated from `.agents/skills`; do not edit them directly.

## Validation

From the repository root with Python 3.11 or later:

```powershell
python scripts/validate-codelore-kit.py
```

The project validator checks required frontmatter, name and description limits, optional field types, the 500-line `SKILL.md` limit, required sections, local links, agent mappings, generated adapters, and metadata version consistency.

The upstream reference validator can be run separately:

```powershell
uvx --from "git+https://github.com/agentskills/agentskills#subdirectory=skills-ref" skills-ref validate .agents/skills/codelore-workflow
```

On Windows, set `PYTHONUTF8=1` first if the validator is run under a non-UTF-8 code page. Official validation confirms format conformance; it does not prove that a particular harness version discovers or invokes a skill. Check the harness versions you support separately.
