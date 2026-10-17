# Codelore agent suite CLI

This package installs Codelore's canonical skills and agent profiles into an existing local repository. It does not perform an analysis itself. Open the target in a supported coding harness and ask for `codelore-workflow` after installation.

## Install with npx

Requires Node.js 20 or later. From the target repository checkout:

```powershell
npx codelore-agent-suite
```

To name a target or limit the harness profiles, use `npx codelore-agent-suite init D:\path\to\target-repo --harness codex`. The published package is [codelore-agent-suite on npm](https://www.npmjs.com/package/codelore-agent-suite).

## Run from source

Requires Node.js 20 or later. From the Codelore repository root:

```powershell
npm --prefix cli run prepack
node cli/bin/codelore.mjs init D:\path\to\target-repo
```

Use `--harness codex` (or repeat `--harness` for several hosts) to install only those profiles. Canonical `.agents/skills` files are always included. Run `node cli/bin/codelore.mjs --help` for the supported host names.

The installer skips identical files and refuses all writes if any selected destination differs or is a symbolic link. It does not overwrite local changes, install a coding harness, grant repository access, or configure a model.

## Package and verify

```powershell
npm --prefix cli test
npm pack ./cli --dry-run
```

The package contains the executable and a generated copy of canonical skills and profiles. `prepack` refreshes that copy for each tarball. It has no runtime dependencies. Its CLI command is `codelore-agent-suite [init [target] [--harness NAME ...]]`; with no arguments it installs into the current directory.

The package is MIT licensed. Its `prepack` script copies the repository's `LICENSE` into the package before packing, so the published artifact includes the same terms.

## Release setup

The manual [release workflow](../.github/workflows/cli-release.yml) verifies Node.js 20 and 24, then publishes the exact tarball it packs. It runs only from `main` and uses the `npm-release` GitHub environment with required reviewers and a `CODELORE` secret containing an npm publish token. Set the `version` input to the version in `cli/package.json` and review the deployment before each release.

For future releases, the owner can configure npm trusted publishing for this workflow and remove the token secret. npm may [stage a release](https://docs.npmjs.com/staged-publishing/) for maintainer approval with two-factor authentication before it becomes publicly available.
