# Contributing to Codelore

Codelore publishes portable codebase review skills, matching agent profiles, and an installer. The 11 canonical skills live in `.agents/skills`, and their matching Codex agents live in `.codex/agents`. Read the [authoring guide](docs/kit-authoring.md) before changing those files. Generate harness adapters from the canonical sources instead of editing generated copies by hand.

## Check a change

From the repository root, with Python 3.11 or later and Node.js 20 or later installed, run:

```powershell
python scripts/generate-harness-adapters.py
python scripts/validate-codelore-kit.py
python scripts/test-install-codelore.py
npm --prefix cli test
git diff --check
```

The validator checks skill structure, links, agent coverage, and generated adapter consistency. The installer tests cover repeat installation and conflict handling. Describe any behavior you could not verify in your pull request.

Use [GitHub Issues](https://github.com/theshantanujoshi/codelore/issues) to report bugs or suggest additions. For installer problems, include the target harness, command, expected result, and actual result. Remove credentials and private repository content from examples or logs.
