# Codelore agent suite CLI

This package installs Codelore's canonical skills and agent profiles into an existing local repository. It does not perform an analysis itself. Open the target in a supported coding harness and ask for `codelore-workflow` after installation.

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

The npm package has not been published. Once it is published, the intended invocation is:

```powershell
npx codelore-agent-suite
```

The package is MIT licensed. Its `prepack` script copies the repository's `LICENSE` into the package before packing, so the published artifact includes the same terms.

## Release setup

The manual [release workflow](../.github/workflows/cli-release.yml) verifies Node.js 20 and 24, then publishes the exact tarball it packs. It runs only from `main` and uses the `npm-release` GitHub environment. Before the first release, configure that environment with required reviewers and a `CODELORE` secret containing an npm token allowed to publish the package. Run the workflow with `version: 0.1.0` only after reviewing the package and approving publication. Do not publish from the working copy.

After the first version exists on npm, the owner can configure npm trusted publishing for this workflow and remove the token secret. Registry and GitHub release settings are external to this repository and are not configured by the source files alone.
