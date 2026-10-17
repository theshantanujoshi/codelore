# Harness support

Codelore keeps its 11 complete skills and reference files in [`.agents/skills`](../.agents/skills). Native agent profiles point to those files. Open this repository as the harness workspace and give the session access to the target checkout. To use Codelore directly inside another checkout, install the project files there:

```powershell
python scripts/install-codelore.py D:\path\to\target-repo
```

The installer requires Python 3.11 or later, copies all supported harness profiles by default, skips identical files, and refuses to overwrite differing files. To install a smaller set, repeat `--harness NAME`; for example, `--harness claude --harness gemini`. It does not install a harness or grant repository access. Run the command from this Codelore checkout, then open the target checkout in your coding harness.

The [Node CLI package](../cli/README.md) provides the same install flow without Python. From this source checkout, prepare its bundled files and run:

```powershell
npm --prefix cli run prepack
node cli/bin/codelore.mjs init D:\path\to\target-repo --harness codex
```

The package is prepared for `npx codelore-agent-suite` from within the target checkout after publication to npm. The source checkout alone does not make that registry command available.

| Harness | Skill discovery | Agent profiles | Invoke |
| --- | --- | --- | --- |
| Codex | `.agents/skills` | `.codex/agents/*.toml` | Ask for `$codelore-workflow` or `codelore_coordinator`. |
| Claude Code | `.claude/skills` shims that load the canonical files | `.claude/agents/*.md` | `/codelore-workflow` or ask for `codelore_coordinator`. |
| Gemini CLI | `.agents/skills` | `.gemini/agents/*.md` | Ask for `codelore-workflow` or start a prompt with `@codelore_coordinator`. |
| Cursor | `.agents/skills` | `.cursor/agents/*.md` | `/codelore-workflow` or ask Agent for `codelore_coordinator`. |
| GitHub Copilot CLI/agent | `.agents/skills` | `.github/agents/*.agent.md` | Ask for `codelore-workflow` or select `codelore_coordinator`. |
| OpenCode | `.agents/skills` | `.opencode/agents/*.md` | Mention `@codelore-workflow` or ask for `codelore_coordinator`. |
| Kiro | `.kiro/skills` shims that load the canonical files | `.kiro/agents/*.json` | Select `codelore_coordinator` or ask Kiro to use `codelore-workflow`. |
| Amp | `.agents/skills` | No native Codelore agent profile | Ask Amp to use `codelore-workflow`; it can follow the specialist skills in one thread. |
| Devin Desktop/Cascade | `.agents/skills` | No native Codelore agent profile | Ask Cascade to use `codelore-workflow`; it can follow the specialist skills in one thread. |
| Google Antigravity | `.agents/skills` | No native Codelore agent profile | Ask for `codelore-workflow` or select it from the skill list. |
| Roo Code | `.agents/skills` | No native Codelore agent profile | Ask Roo to use `codelore-workflow`. |
| Cline | `.claude/skills` shims | No native Codelore agent profile | Use `/codelore-workflow` or ask Cline to use it. |
| Aider | Load a skill as a read-only conventions file | No native Codelore agent profile | Start with `aider --read .agents/skills/codelore-workflow/SKILL.md` and explicitly supply referenced files when needed. |

The first seven rows include a skill and agent pairing. Other listed harnesses can use the portable skill workflow without a matching agent profile. A full review can run sequentially in any harness; parallel delegation depends on its agent runtime and permissions. Aider requires manual context loading because it does not use Agent Skills discovery. No harness is given a fixed model, API key, or elevated tool access by these files.

## Maintaining adapters

Edit the canonical [`SKILL.md`](../.agents/skills/codelore-workflow/SKILL.md) files, their references, and the matching [Codex TOML profiles](../.codex/agents). With Python 3.11 or later, regenerate the native adapters:

```powershell
python scripts/generate-harness-adapters.py
python scripts/generate-harness-adapters.py --check
python scripts/validate-codelore-kit.py
python scripts/test-install-codelore.py
```

The [generator](../scripts/generate-harness-adapters.py) creates Claude and Kiro skill shims and 11 agent profiles for each of Claude Code, Cursor, Gemini CLI, GitHub Copilot, OpenCode, and Kiro. `--check` reports missing or stale generated files without writing. Review the generated files before committing them. The generator does not install a harness or validate that a specific installed version discovers the files.

## Format sources

Kiro formats follow [Kiro skills](https://kiro.dev/docs/skills/) and [custom agents](https://kiro.dev/docs/custom-agents/).

The adapter locations and formats follow the vendors' current documentation: [Claude Code skills](https://code.claude.com/docs/en/skills) and [subagents](https://code.claude.com/docs/en/sub-agents), [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/) and [subagents](https://geminicli.com/docs/core/subagents/), [Cursor skills](https://cursor.com/help/customization/skills) and [subagents](https://cursor.com/docs/subagents), [GitHub Copilot skills](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/customization-cheat-sheet) and [agents](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents), [OpenCode skills](https://opencode.ai/docs/skills) and [agents](https://opencode.ai/docs/agents/), [Amp skills](https://ampcode.com/docs/customize/skills), [Devin Desktop/Cascade skills](https://docs.devin.ai/desktop/cascade/skills), [Google Antigravity skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills), [Roo Code skills](https://docs.roocode.com/features/skills), [Cline skills](https://docs.cline.bot/customization/skills), and [Aider conventions files](https://aider.chat/docs/usage/conventions.html).
