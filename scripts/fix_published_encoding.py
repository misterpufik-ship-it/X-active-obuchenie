"""Fix mojibake in published-lessons.json and optionally rebuild from builder."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = ROOT / "site" / "published-lessons.json"


def looks_mojibake(value: str) -> bool:
    if not value:
        return False
    if any(ord(ch) > 127 for ch in value):
        return "╨" in value or "╤" in value or "╥" in value
    return False


def fix_text(value: str) -> str:
    if not isinstance(value, str) or not looks_mojibake(value):
        return value
    for encoding in ("cp437", "latin-1", "cp1252"):
        try:
            fixed = value.encode(encoding).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
        if fixed and not looks_mojibake(fixed):
            return fixed
    return value


def fix_obj(value: Any) -> Any:
    if isinstance(value, str):
        return fix_text(value)
    if isinstance(value, list):
        return [fix_obj(item) for item in value]
    if isinstance(value, dict):
        return {key: fix_obj(item) for key, item in value.items()}
    return value


def main() -> int:
    if not PUBLISHED.is_file():
        print(f"Missing {PUBLISHED}")
        return 1

    data = json.loads(PUBLISHED.read_text(encoding="utf-8-sig"))
    fixed = fix_obj(data)
    PUBLISHED.write_text(json.dumps(fixed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Fixed {PUBLISHED}")
    if fixed and isinstance(fixed, list):
        for item in fixed:
            print(f" - {item.get('id')}: {item.get('topic')} / {item.get('title')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
