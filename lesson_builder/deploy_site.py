"""Commit published site files and deploy to BeGet hosting."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = REPO_ROOT / "site"
DEPLOY_BIN = Path("/srv/deploy/bin/deploy-site")
DEPLOY_PROJECT = "x-active-obuchenie"


def _run(command: list[str], cwd: Path, timeout: int = 300) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def auto_deploy(material_id: str) -> dict[str, Any]:
    if not DEPLOY_BIN.is_file():
        return {"deployed": False, "message": "Автодеплой доступен только на VPS."}

    paths_to_add = [
        "site/published-lessons.json",
        "site/assets/",
        "site/videos/",
    ]
    _run(["git", "add", *paths_to_add], REPO_ROOT)

    status = _run(["git", "status", "--porcelain", "site/"], REPO_ROOT)
    if status.stdout.strip():
        commit = _run(
            ["git", "commit", "-m", f"Publish lesson: {material_id}"],
            REPO_ROOT,
        )
        if commit.returncode != 0:
            return {
                "deployed": False,
                "message": f"Не удалось закоммитить: {commit.stderr.strip() or commit.stdout.strip()}",
            }

        push = _run(["git", "push", "origin", "main"], REPO_ROOT, timeout=120)
        if push.returncode != 0:
            return {
                "deployed": False,
                "message": f"Не удалось отправить в GitHub: {push.stderr.strip() or push.stdout.strip()}",
            }

    deploy = _run([str(DEPLOY_BIN), DEPLOY_PROJECT], REPO_ROOT, timeout=600)
    if deploy.returncode != 0:
        tail = (deploy.stderr or deploy.stdout or "").strip()[-400:]
        return {"deployed": False, "message": f"Ошибка деплоя: {tail}"}

    return {
        "deployed": True,
        "message": "Урок опубликован и сайт задеплоен на хостинг.",
        "url": f"https://nostradamus-1503.ru/obuchenie/?lesson={material_id}",
    }
