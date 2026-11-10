#!/usr/bin/env python3
"""Create a measured inventory for a repository checkout.

The output is a JSON document by default so a Codelore session can cite
counts, revision, method, and exclusions without re-deriving them. Use
``--format text`` for a short human-readable summary.

This script is intentionally read-only. It uses Git when available and
falls back to a filesystem walk. It never follows symlinks outside the
target and never reads likely secret files.

Exit codes:
  0  inventory produced
  2  invalid target or arguments

Requires Python 3.11 or later. Standard library only.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

SCHEMA = "codelore.inventory.v1"
SAMPLE_BYTES = 8192

LANGUAGE_BY_EXT = {
    ".bash": "Shell",
    ".c": "C",
    ".cc": "C++",
    ".clj": "Clojure",
    ".cpp": "C++",
    ".cs": "C#",
    ".css": "CSS",
    ".cxx": "C++",
    ".dart": "Dart",
    ".erl": "Erlang",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".fs": "F#",
    ".fsx": "F#",
    ".go": "Go",
    ".h": "C",
    ".hpp": "C++",
    ".hs": "Haskell",
    ".html": "HTML",
    ".java": "Java",
    ".json": "JSON",
    ".jsx": "JavaScript",
    ".js": "JavaScript",
    ".cjs": "JavaScript",
    ".mjs": "JavaScript",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".lua": "Lua",
    ".md": "Markdown",
    ".mdx": "Markdown",
    ".m": "Objective-C",
    ".mm": "Objective-C",
    ".php": "PHP",
    ".ps1": "PowerShell",
    ".py": "Python",
    ".pyi": "Python",
    ".r": "R",
    ".rb": "Ruby",
    ".rs": "Rust",
    ".scala": "Scala",
    ".scss": "SCSS",
    ".sh": "Shell",
    ".sql": "SQL",
    ".svelte": "Svelte",
    ".swift": "Swift",
    ".toml": "TOML",
    ".tsx": "TypeScript",
    ".ts": "TypeScript",
    ".cts": "TypeScript",
    ".mts": "TypeScript",
    ".vue": "Vue",
    ".xml": "XML",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".zsh": "Shell",
}

LANGUAGE_BY_NAME = {
    "Dockerfile": "Dockerfile",
    "Gemfile": "Ruby",
    "Makefile": "Makefile",
    "Rakefile": "Ruby",
}

DOC_EXTENSIONS = {".adoc", ".asciidoc", ".md", ".mdx", ".rst", ".txt"}
CONFIG_EXTENSIONS = {
    ".cfg", ".conf", ".editorconfig", ".env", ".ini", ".jsonc", ".properties",
    ".toml", ".yaml", ".yml", ".xml",
}
BINARY_EXTENSIONS = {
    ".7z", ".a", ".avi", ".bmp", ".class", ".dll", ".dylib", ".eot", ".exe",
    ".flac", ".gif", ".gz", ".ico", ".jar", ".jpeg", ".jpg", ".lib", ".mov",
    ".mp3", ".mp4", ".o", ".otf", ".pdf", ".png", ".so", ".tar", ".tgz",
    ".ttf", ".wav", ".webm", ".webp", ".woff", ".woff2", ".zip",
}

VENDORED_DIRECTORIES = {
    ".git", ".tox", ".venv", "bower_components", "carthage", "external",
    "node_modules", "pods", "site-packages", "third-party", "third_party",
    "vendor", "venv",
}
GENERATED_DIRECTORIES = {
    ".cache", ".gradle", ".mypy_cache", ".next", ".npm-cache", ".nuxt",
    ".output", ".parcel-cache", ".pnpm-store", ".pytest_cache", ".ruff_cache",
    ".terraform", ".turbo", ".yarn", "__pycache__", "build", "coverage",
    "dist",
}
GENERATED_NAMES = (
    ".designer.cs", ".freezed.dart", ".g.dart", ".generated.cs", ".min.css",
    ".min.js",
)
TEST_DIRECTORIES = {"__tests__", "e2e", "integration_tests", "spec", "specs", "test", "tests"}
TEST_SUFFIXES = (
    "Test.java", "Tests.cs", "Test.kt", "Spec.scala", "_spec.rb", "_test.go",
    "_test.py", "_test.rb", "_test.rs",
)
SECRET_NAMES = {".env", ".netrc", ".npmrc", ".pypirc", "credentials.json", "id_ed25519", "id_rsa"}
SECRET_EXTENSIONS = {".jks", ".key", ".keystore", ".p12", ".pem", ".pfx"}
LOCKFILE_NAMES = {
    "bun.lockb", "cargo.lock", "composer.lock", "gemfile.lock", "go.sum",
    "gradle.lockfile", "mix.lock", "npm-shrinkwrap.json", "package-lock.json",
    "pipfile.lock", "pnpm-lock.yaml", "poetry.lock", "uv.lock", "yarn.lock",
}
MANIFEST_NAMES = {
    "build.gradle", "build.gradle.kts", "cargo.toml", "composer.json",
    "deno.json", "deno.jsonc", "gemfile", "go.mod", "mix.exs", "package.json",
    "pipfile", "pom.xml", "pyproject.toml", "requirements.txt", "setup.cfg",
    "setup.py", "settings.gradle", "settings.gradle.kts",
}
MANIFEST_SUFFIXES = (".csproj", ".fsproj", ".gemspec", ".sln", ".vbproj")
ENTRY_POINT_NAMES = {
    "Program.cs", "app.py", "cli.js", "cli.mjs", "cli.ts", "docker-compose.yaml",
    "docker-compose.yml", "Dockerfile", "index.cjs", "index.js", "index.mjs",
    "index.ts", "main.c", "main.cpp", "main.go", "main.py", "main.rs",
    "manage.py", "server.js", "server.ts", "wsgi.py", "asgi.py",
}


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a measured inventory for a repository checkout.",
        epilog=(
            "Exit codes: 0 = inventory produced; 2 = invalid target or arguments.\n"
            "The default output is JSON. Diagnostics are written to stderr."
        ),
    )
    parser.add_argument(
        "--path",
        default=".",
        help="repository checkout to inspect (default: current directory)",
    )
    parser.add_argument(
        "--format",
        choices=("json", "text"),
        default="json",
        help="output format (default: json)",
    )
    parser.add_argument(
        "--max-file-bytes",
        type=int,
        default=2_000_000,
        help="skip line counting for files larger than this many bytes (default: 2000000)",
    )
    parser.add_argument(
        "--max-files",
        type=int,
        default=50_000,
        help="maximum discovered paths to inspect (default: 50000)",
    )
    parser.add_argument(
        "--no-git",
        action="store_true",
        help="use a filesystem walk even when Git is available",
    )
    args = parser.parse_args(argv)
    if args.max_file_bytes < 0:
        parser.error("--max-file-bytes must be zero or greater")
    if args.max_files < 1:
        parser.error("--max-files must be one or greater")
    return args


def run_git(root: Path, *args: str) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        ["git", "-C", str(root), *args],
        capture_output=True,
        check=False,
    )


def git_text(root: Path, *args: str) -> str | None:
    try:
        result = run_git(root, *args)
    except FileNotFoundError:
        return None
    if result.returncode != 0:
        return None
    return result.stdout.decode("utf-8", "replace").strip()


def git_paths(root: Path) -> tuple[list[str] | None, str]:
    """Return tracked and untracked non-ignored paths, or None if Git is unavailable."""
    try:
        result = run_git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard")
    except FileNotFoundError:
        return None, "git executable not found"
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", "replace").strip() or "git ls-files failed"
        return None, message
    decoded = result.stdout.decode("utf-8", "surrogateescape")
    return [item for item in decoded.split("\0") if item], ""


def walk_paths(root: Path) -> tuple[list[str], list[str]]:
    paths: list[str] = []
    skipped: set[str] = set()

    def on_error(_error: OSError) -> None:
        return

    for directory, directories, files in os.walk(root, topdown=True, onerror=on_error, followlinks=False):
        kept: list[str] = []
        for name in sorted(directories):
            lowered = name.lower()
            if lowered in VENDORED_DIRECTORIES or lowered in GENERATED_DIRECTORIES:
                skipped.add(name)
            else:
                kept.append(name)
        directories[:] = kept
        for name in sorted(files):
            paths.append((Path(directory) / name).relative_to(root).as_posix())
    return paths, sorted(skipped)


def is_vendored(relative: PurePosixPath) -> bool:
    return any(part.lower() in VENDORED_DIRECTORIES for part in relative.parts[:-1])


def is_generated(relative: PurePosixPath) -> bool:
    parts = [part.lower() for part in relative.parts[:-1]]
    if any(part in GENERATED_DIRECTORIES for part in parts):
        return True
    if parts[:1] == ["target"]:
        return True
    name = relative.name.lower()
    return name.endswith(GENERATED_NAMES) or name.endswith(".map")


def is_secret(relative: PurePosixPath) -> bool:
    name = relative.name.lower()
    if name in SECRET_NAMES:
        return True
    if name.startswith(".env.") and name not in {".env.example", ".env.sample", ".env.template"}:
        return True
    return relative.suffix.lower() in SECRET_EXTENSIONS


def is_manifest(name: str) -> bool:
    lowered = name.lower()
    return (
        lowered in MANIFEST_NAMES
        or lowered.endswith(MANIFEST_SUFFIXES)
        or (lowered.startswith("requirements") and lowered.endswith(".txt"))
    )


def is_lockfile(name: str) -> bool:
    lowered = name.lower()
    return lowered in LOCKFILE_NAMES or lowered.endswith(".lock")


def is_test(relative: PurePosixPath) -> bool:
    name = relative.name
    if any(part.lower() in TEST_DIRECTORIES for part in relative.parts[:-1]):
        return True
    if name.startswith("test_") or name.startswith("spec_"):
        return True
    if name.endswith(TEST_SUFFIXES):
        return True
    lowered = name.lower()
    return ".test." in lowered or ".spec." in lowered or ".e2e." in lowered


def is_documentation(name: str) -> bool:
    lowered = name.lower()
    return (
        PurePosixPath(lowered).suffix in DOC_EXTENSIONS
        or lowered.startswith(("readme", "changelog", "contributing", "license", "notice", "authors"))
    )


def is_config(name: str) -> bool:
    lowered = name.lower()
    return (
        PurePosixPath(lowered).suffix in CONFIG_EXTENSIONS
        or lowered.startswith(".")
        or lowered in {"dockerfile", "makefile", "procfile"}
    )


def language_for(name: str) -> str:
    if name in LANGUAGE_BY_NAME:
        return LANGUAGE_BY_NAME[name]
    return LANGUAGE_BY_EXT.get(PurePosixPath(name).suffix.lower(), "Other")


def category_for(relative: PurePosixPath) -> str:
    name = relative.name
    if is_manifest(name):
        return "manifest"
    if is_lockfile(name):
        return "lockfile"
    if is_test(relative):
        return "test"
    if is_documentation(name):
        return "docs"
    if is_config(name):
        return "config"
    if PurePosixPath(name).suffix.lower() in LANGUAGE_BY_EXT or name in LANGUAGE_BY_NAME:
        return "source"
    return "other"


def is_entry_point(relative: PurePosixPath) -> bool:
    name = relative.name
    if name in ENTRY_POINT_NAMES:
        return True
    if relative.parts[:1] == ("cmd",) and name == "main.go":
        return True
    if len(relative.parts) >= 3 and relative.parts[:2] == (".github", "workflows"):
        return name.endswith((".yml", ".yaml"))
    return False


def read_text(path: Path, max_bytes: int) -> tuple[str | None, str]:
    """Return an exclusion reason and decoded text, or (None, text) on success."""
    try:
        if path.is_symlink():
            return "symlink", ""
        size = path.stat().st_size
    except OSError:
        return "unreadable", ""
    if size > max_bytes:
        return "too_large", ""
    try:
        with path.open("rb") as handle:
            sample = handle.read(SAMPLE_BYTES)
            if b"\x00" in sample:
                return "binary", ""
            handle.seek(0)
            data = handle.read()
    except OSError:
        return "unreadable", ""
    for encoding in ("utf-8-sig", "utf-8"):
        try:
            return None, data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return "undecodable", ""


def empty_counts() -> dict[str, int]:
    return {"files": 0, "physical_lines": 0, "nonblank_lines": 0, "bytes": 0}


def add_counts(target: dict[str, int], size: int, physical: int, nonblank: int) -> None:
    target["files"] += 1
    target["physical_lines"] += physical
    target["nonblank_lines"] += nonblank
    target["bytes"] += size


def inventory(root: Path, max_file_bytes: int, max_files: int, use_git: bool = True) -> dict:
    if use_git:
        paths, git_error = git_paths(root)
    else:
        paths, git_error = None, "Git disabled by --no-git"
    used_git = paths is not None
    skipped_directories: list[str] = []
    if paths is None:
        paths, skipped_directories = walk_paths(root)
        method = "filesystem walk (symlinks not followed)"
    else:
        method = "git ls-files -z --cached --others --exclude-standard"

    discovered_files = len(paths)
    truncated = discovered_files > max_files
    inspected_paths = paths[:max_files]

    commit = git_text(root, "rev-parse", "HEAD") if used_git else None
    branch = git_text(root, "rev-parse", "--abbrev-ref", "HEAD") if used_git else None
    dirty = None
    if used_git:
        try:
            status = run_git(root, "status", "--porcelain")
            dirty = status.returncode == 0 and bool(status.stdout.strip())
        except FileNotFoundError:
            used_git = False

    excluded: Counter[str] = Counter()
    categories: dict[str, dict[str, int]] = {}
    languages: dict[str, dict[str, int]] = {}
    manifests: list[str] = []
    lockfiles: list[str] = []
    entry_points: list[str] = []
    totals = empty_counts()

    for raw_path in inspected_paths:
        relative = PurePosixPath(raw_path)
        if relative.is_absolute() or ".." in relative.parts:
            excluded["outside_target"] += 1
            continue
        if is_vendored(relative):
            excluded["vendored"] += 1
            continue
        if is_generated(relative):
            excluded["generated"] += 1
            continue
        if is_secret(relative):
            excluded["secrets"] += 1
            continue
        if relative.suffix.lower() in BINARY_EXTENSIONS:
            excluded["binary"] += 1
            continue
        path = root / Path(*relative.parts)
        if not path.is_file():
            excluded["missing"] += 1
            continue
        try:
            size = path.stat().st_size
        except OSError:
            excluded["unreadable"] += 1
            continue
        text = read_text(path, max_file_bytes)
        if text is None:
            excluded["unreadable"] += 1
            continue
        reason, content = text
        if reason:
            excluded[reason] += 1
            continue

        physical = len(content.splitlines())
        nonblank = sum(1 for line in content.splitlines() if line.strip())
        category = category_for(relative)
        add_counts(categories.setdefault(category, empty_counts()), size, physical, nonblank)
        add_counts(languages.setdefault(language_for(relative.name), empty_counts()), size, physical, nonblank)
        add_counts(totals, size, physical, nonblank)
        if category == "manifest":
            manifests.append(relative.as_posix())
        if category == "lockfile":
            lockfiles.append(relative.as_posix())
        if is_entry_point(relative):
            entry_points.append(relative.as_posix())

    limits: list[str] = []
    if not used_git:
        limits.append(
            "Git data unavailable: revision is unknown and paths came from a filesystem walk"
            + (f" ({git_error})" if git_error else "")
        )
    elif not commit:
        limits.append("Repository has no readable commit; use the branch and observation time as identity")
    if truncated:
        limits.append(
            f"Only the first {max_files} of {discovered_files} discovered paths were inspected"
        )
    if skipped_directories:
        limits.append("Skipped dependency/build directories: " + ", ".join(skipped_directories))
    for reason, count in sorted(excluded.items()):
        limits.append(f"Excluded {count} {reason} path(s) from line counts")
    if discovered_files == 0:
        limits.append("No files were discovered; confirm the target and ignore rules")

    return {
        "schema": SCHEMA,
        "observed_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "target": str(root),
        "method": method,
        "revision": {
            "git_available": used_git,
            "commit": commit,
            "branch": branch,
            "dirty": dirty,
        },
        "settings": {
            "max_file_bytes": max_file_bytes,
            "max_files": max_files,
        },
        "totals": {
            **totals,
            "analyzed_files": totals["files"],
            "discovered_files": discovered_files,
        },
        "categories": dict(sorted(categories.items())),
        "languages": dict(sorted(languages.items())),
        "manifests": sorted(manifests),
        "lockfiles": sorted(lockfiles),
        "entry_point_candidates": sorted(entry_points),
        "excluded": dict(sorted(excluded.items())),
        "limits": limits,
    }


def text_summary(data: dict) -> str:
    revision = data["revision"]
    identity = revision["commit"] or "unknown commit"
    branch = revision["branch"] or "unknown branch"
    if revision["dirty"] is None:
        dirty = "worktree state unknown"
    else:
        dirty = "dirty" if revision["dirty"] else "clean"
    totals = data["totals"]
    lines = [
        "Codelore inventory",
        f"Target: {data['target']}",
        f"Revision: {identity} ({branch}, {dirty})",
        f"Method: {data['method']}",
        (
            f"Files: {totals['analyzed_files']} analyzed of {totals['discovered_files']} discovered; "
            f"{totals['physical_lines']} physical lines / {totals['nonblank_lines']} nonblank"
        ),
    ]
    if data["categories"]:
        categories = ", ".join(
            f"{name}={counts['files']}" for name, counts in data["categories"].items()
        )
        lines.append(f"Categories: {categories}")
    if data["languages"]:
        languages = ", ".join(
            f"{name}={counts['files']}" for name, counts in data["languages"].items()
        )
        lines.append(f"Languages: {languages}")
    if data["manifests"]:
        lines.append("Manifests: " + ", ".join(data["manifests"]))
    if data["lockfiles"]:
        lines.append("Lockfiles: " + ", ".join(data["lockfiles"]))
    if data["entry_point_candidates"]:
        lines.append("Entry-point candidates: " + ", ".join(data["entry_point_candidates"]))
    if data["limits"]:
        lines.append("Limits:")
        lines.extend(f"- {limit}" for limit in data["limits"])
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    root = Path(args.path).expanduser()
    if not root.exists() or not root.is_dir():
        print(f"Error: target is not a directory: {root}", file=sys.stderr)
        return 2
    root = root.resolve()
    data = inventory(root, args.max_file_bytes, args.max_files, use_git=not args.no_git)
    if args.format == "json":
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(text_summary(data))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
