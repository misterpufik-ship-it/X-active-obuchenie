"""Deploy published site files to BeGet hosting."""

from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = REPO_ROOT / "site"
DEPLOY_ENV = Path("/srv/deploy/projects/x-active-obuchenie/deploy.env")
DEPLOY_BIN = Path("/srv/deploy/bin/deploy-site")
DEPLOY_PROJECT = "x-active-obuchenie"


def _run(command: list[str], cwd: Path | None = None, timeout: int = 300) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def _load_deploy_env() -> dict[str, str]:
    if not DEPLOY_ENV.is_file():
        return {}
    values: dict[str, str] = {}
    for line in DEPLOY_ENV.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def _rsync_to_hosting(env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    hosting_user = env.get("HOSTING_USER", "")
    hosting_host = env.get("HOSTING_HOST", "")
    hosting_path = env.get("HOSTING_PATH", "")
    backup_path = env.get("BACKUP_PATH", "~/deploy_backups/x-active-obuchenie")
    if not hosting_user or not hosting_host or not hosting_path:
        raise RuntimeError("В deploy.env не заданы HOSTING_USER/HOSTING_HOST/HOSTING_PATH.")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    remote = f"{hosting_user}@{hosting_host}"
    ssh_base = ["ssh", remote]

    _run([*ssh_base, f"mkdir -p '{backup_path}/{timestamp}'"], timeout=60)
    _run(
        [
            *ssh_base,
            f"if [ -d '{hosting_path}' ]; then cp -a '{hosting_path}/.' '{backup_path}/{timestamp}/' || true; fi",
        ],
        timeout=180,
    )

    excludes = [
        "--exclude=.git/",
        "--exclude=.env",
        "--exclude=node_modules/",
    ]
    source = str(SITE_DIR).replace("\\", "/")
    if not source.endswith("/"):
        source += "/"

    return _run(
        ["rsync", "-az", *excludes, source, f"{remote}:{hosting_path}/"],
        timeout=600,
    )


def _try_git_sync(material_id: str) -> str | None:
    """Best-effort git commit/push; returns warning text if push failed."""
    paths_to_add = ["site/published-lessons.json", "site/assets/", "site/videos/"]
    _run(["git", "add", *paths_to_add], REPO_ROOT)

    status = _run(["git", "status", "--porcelain", "site/"], REPO_ROOT)
    if not status.stdout.strip():
        return None

    commit = _run(["git", "commit", "-m", f"Publish lesson: {material_id}"], REPO_ROOT)
    if commit.returncode != 0:
        return None

    push = _run(["git", "push", "origin", "main"], REPO_ROOT, timeout=120)
    if push.returncode != 0:
        tail = (push.stderr or push.stdout or "").strip()
        if "could not read Username" in tail or "Authentication failed" in tail:
            return "GitHub push пропущен (на сервере нет токена) — файлы отправлены на хостинг напрямую."
        return f"GitHub push не выполнен: {tail[:180]}"
    return None


def auto_deploy(material_id: str) -> dict[str, Any]:
    url = f"https://nostradamus-1503.ru/obuchenie/?lesson={material_id}"

    if not SITE_DIR.is_dir():
        return {"deployed": False, "message": "Папка site/ не найдена.", "url": url}

    env = _load_deploy_env()
    if env:
        try:
            rsync = _rsync_to_hosting(env)
        except Exception as exc:  # noqa: BLE001
            return {"deployed": False, "message": str(exc), "url": url}

        if rsync.returncode != 0:
            tail = (rsync.stderr or rsync.stdout or "").strip()[-400:]
            return {"deployed": False, "message": f"Ошибка отправки на хостинг: {tail}", "url": url}

        git_note = _try_git_sync(material_id)
        message = "Урок опубликован и сайт обновлён на хостинге."
        if git_note:
            message = f"{message} {git_note}"
        return {"deployed": True, "message": message, "url": url}

    if DEPLOY_BIN.is_file():
        deploy = _run([str(DEPLOY_BIN), DEPLOY_PROJECT], REPO_ROOT, timeout=600)
        if deploy.returncode == 0:
            return {
                "deployed": True,
                "message": "Урок опубликован и сайт задеплоен на хостинг.",
                "url": url,
            }
        tail = (deploy.stderr or deploy.stdout or "").strip()[-400:]
        return {"deployed": False, "message": f"Ошибка деплоя: {tail}", "url": url}

    return {
        "deployed": False,
        "message": "Урок сохранён локально. Автодеплой доступен только на VPS.",
        "url": url,
    }
