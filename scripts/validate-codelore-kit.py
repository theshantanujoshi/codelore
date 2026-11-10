"""Validate Codelore's canonical skill/agent suite and generated adapters.

The frontmatter checks follow the Agent Skills specification with the
additional project rules used by Codelore: a license, identifying metadata,
substantive procedure sections, and resolvable local references.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tomllib
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / ".agents" / "skills"
AGENTS = ROOT / ".codex" / "agents"
PACKAGE = ROOT / "cli" / "package.json"
SKILL_REF = re.compile(r"\.agents/skills/([a-z0-9-]+)/SKILL\.md")
LINK = re.compile(r"(?<!!)\[[^]]+\]\(([^)]+)\)")
REQUIRED_SECTIONS = ("## When to use", "## Inputs to gather", "## Workflow", "## Report")
ALLOWED_FIELDS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_NAME_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 1024
MAX_COMPATIBILITY_LENGTH = 500
MAX_SKILL_LINES = 500


def parse_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] == '"':
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid quoted value: {exc}") from exc
        if not isinstance(parsed, str):
            raise ValueError("frontmatter values must be strings")
        return parsed
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1].replace("''", "'")
    return value


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---\n"):
        raise ValueError("missing YAML frontmatter")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise ValueError("unclosed YAML frontmatter")
    header = text[4:end]
    body = text[end + 5 :]
    fields: dict[str, Any] = {}
    metadata: dict[str, str] = {}
    in_metadata = False

    for number, raw in enumerate(header.splitlines(), start=2):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw[0] in " \t":
            if not in_metadata:
                raise ValueError(f"line {number}: unexpected indentation")
            key, separator, value = raw.strip().partition(":")
            if not separator or not key.strip():
                raise ValueError(f"line {number}: expected 'key: value'")
            key = key.strip()
            if key in metadata:
                raise ValueError(f"line {number}: duplicate metadata key '{key}'")
            metadata[key] = parse_scalar(value)
            continue

        key, separator, value = raw.partition(":")
        if not separator or not key.strip():
            raise ValueError(f"line {number}: expected 'key: value'")
        key = key.strip()
        in_metadata = False
        if key in fields:
            raise ValueError(f"line {number}: duplicate field '{key}'")
        if key == "metadata":
            if value.strip():
                raise ValueError(f"line {number}: metadata must be a block mapping")
            fields[key] = metadata
            in_metadata = True
            continue
        fields[key] = parse_scalar(value)

    return fields, body


def validate_skill(path: Path, *, require_sections: bool = True) -> list[str]:
    relative = path.relative_to(ROOT).as_posix()
    try:
        text = path.read_text(encoding="utf-8-sig")
        fields, body = parse_frontmatter(text)
    except (OSError, ValueError) as exc:
        return [f"{relative}: {exc}"]

    errors: list[str] = []
    unknown = set(fields) - ALLOWED_FIELDS
    if unknown:
        errors.append(f"{relative}: unsupported frontmatter fields: {', '.join(sorted(unknown))}")

    name = fields.get("name")
    if not isinstance(name, str) or not name:
        errors.append(f"{relative}: missing or non-string name")
    else:
        if len(name) > MAX_NAME_LENGTH:
            errors.append(f"{relative}: name exceeds {MAX_NAME_LENGTH} characters")
        if not NAME_PATTERN.fullmatch(name):
            errors.append(f"{relative}: name must use lowercase letters, digits, and single hyphens")
        if name != path.parent.name:
            errors.append(f"{relative}: name does not match directory")

    description = fields.get("description")
    if not isinstance(description, str) or not description.strip():
        errors.append(f"{relative}: missing or empty description")
    else:
        if len(description) > MAX_DESCRIPTION_LENGTH:
            errors.append(f"{relative}: description exceeds {MAX_DESCRIPTION_LENGTH} characters")
        if len(description) < 80 or "not for" not in description.lower():
            errors.append(f"{relative}: description is too vague; state what it does and what it is not for")

    license_name = fields.get("license")
    if not isinstance(license_name, str) or not license_name.strip():
        errors.append(f"{relative}: missing or empty license")
    elif license_name != "MIT":
        errors.append(f"{relative}: license must match the repository's MIT license")

    compatibility = fields.get("compatibility")
    if compatibility is not None:
        if not isinstance(compatibility, str) or not compatibility.strip():
            errors.append(f"{relative}: compatibility must be a non-empty string")
        elif len(compatibility) > MAX_COMPATIBILITY_LENGTH:
            errors.append(f"{relative}: compatibility exceeds {MAX_COMPATIBILITY_LENGTH} characters")

    allowed_tools = fields.get("allowed-tools")
    if allowed_tools is not None and (not isinstance(allowed_tools, str) or not allowed_tools.strip()):
        errors.append(f"{relative}: allowed-tools must be a non-empty space-separated string")

    metadata = fields.get("metadata")
    if not isinstance(metadata, dict) or not metadata:
        errors.append(f"{relative}: metadata must be a non-empty mapping")
    else:
        for key, value in metadata.items():
            if not isinstance(key, str) or not isinstance(value, str) or not value:
                errors.append(f"{relative}: metadata keys and values must be non-empty strings")
        for required in ("author", "version", "standard"):
            if not metadata.get(required):
                errors.append(f"{relative}: metadata.{required} is required")
        if metadata.get("standard") and metadata.get("standard") != "agent-skills":
            errors.append(f"{relative}: metadata.standard must be agent-skills")

    line_count = len(text.splitlines())
    if line_count > MAX_SKILL_LINES:
        errors.append(f"{relative}: {line_count} lines exceeds the {MAX_SKILL_LINES}-line skill limit")

    if require_sections:
        if line_count < 35:
            errors.append(f"{relative}: skill needs substantive procedure and checks")
        for section in REQUIRED_SECTIONS:
            if section not in body:
                errors.append(f"{relative}: missing {section}")
        for raw_link in LINK.findall(body):
            target = raw_link.split("#", 1)[0].strip()
            if target and not target.startswith(("http://", "https://", "mailto:")):
                resolved = (path.parent / target).resolve()
                try:
                    inside = resolved.is_relative_to(ROOT.resolve())
                except ValueError:
                    inside = False
                if not inside or not resolved.exists():
                    errors.append(f"{relative}: broken link {raw_link}")

    return errors


def package_version() -> str | None:
    try:
        data = json.loads(PACKAGE.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return None
    version = data.get("version")
    return version if isinstance(version, str) else None


def validate() -> list[str]:
    errors: list[str] = []
    skills: dict[str, Path] = {}
    expected_version = package_version()

    for directory in sorted(path for path in SKILLS.iterdir() if path.is_dir()):
        skill_md = directory / "SKILL.md"
        if not skill_md.is_file():
            errors.append(f"{directory.relative_to(ROOT).as_posix()}: missing SKILL.md")

    for path in sorted(SKILLS.glob("*/SKILL.md")):
        errors.extend(validate_skill(path))
        skills[path.parent.name] = path
        if expected_version:
            try:
                fields, _ = parse_frontmatter(path.read_text(encoding="utf-8-sig"))
            except (OSError, ValueError):
                continue
            metadata = fields.get("metadata")
            if isinstance(metadata, dict) and metadata.get("version") != expected_version:
                errors.append(
                    f"{path.relative_to(ROOT).as_posix()}: metadata.version does not match "
                    f"cli/package.json ({expected_version})"
                )

    for harness in ("claude", "kiro"):
        for path in sorted((ROOT / f".{harness}" / "skills").glob("*/SKILL.md")):
            errors.extend(validate_skill(path, require_sections=False))

    mapped: set[str] = set()
    agent_paths = sorted(AGENTS.glob("*.toml"))
    for path in agent_paths:
        relative = path.relative_to(ROOT).as_posix()
        try:
            agent = tomllib.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, tomllib.TOMLDecodeError) as exc:
            errors.append(f"{relative}: {exc}")
            continue
        if agent.get("name") != path.stem:
            errors.append(f"{relative}: name does not match filename")
        references = SKILL_REF.findall(agent.get("developer_instructions", ""))
        if len(references) != 1 or references[0] not in skills:
            errors.append(f"{relative}: expected exactly one existing canonical skill")
        else:
            if references[0] in mapped:
                errors.append(f"{relative}: duplicate mapping for {references[0]}")
            mapped.add(references[0])
        if len(agent.get("developer_instructions", "").strip()) < 250:
            errors.append(f"{relative}: agent instructions need scope and output guidance")

    if not skills or mapped != set(skills):
        errors.append(f"Skill/agent coverage differs: skills={len(skills)}, mapped={len(mapped)}")
    if not agent_paths:
        errors.append("No Codex agent profiles found")

    generated = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate-harness-adapters.py"), "--check"],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    if generated.returncode:
        errors.append("Generated adapters are stale: " + (generated.stderr or generated.stdout).strip())
    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit(1)
    print("Validated Agent Skills frontmatter, Codelore sections, links, agent mappings, and generated adapters")
