"""Publish lesson project into the training site."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from . import storage
from .deploy_site import auto_deploy
from .export import render_annotated_image

SITE_ROOT = Path(__file__).resolve().parents[1] / "site"
PUBLISHED_FILE = SITE_ROOT / "published-lessons.json"
ASSETS_DIR = SITE_ROOT / "assets"
VIDEOS_DIR = SITE_ROOT / "videos"


def _load_published() -> list[dict[str, Any]]:
    if not PUBLISHED_FILE.is_file():
        return []
    return json.loads(PUBLISHED_FILE.read_text(encoding="utf-8"))


def _save_published(items: list[dict[str, Any]]) -> None:
    PUBLISHED_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLISHED_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def publish_to_site(project_id: str) -> dict[str, Any]:
    data = storage.load_project(project_id)
    if not data.get("steps"):
        raise RuntimeError("Добавьте хотя бы один шаг перед публикацией.")

    material_id = storage.slugify(data.get("title", "urok"))
    existing = _load_published()
    if any(item.get("id") == material_id for item in existing):
        material_id = f"{material_id}-{project_id[-6:]}"

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    video_rel = ""
    video_name = data.get("videoFile")
    if video_name:
        source_video = storage.project_dir(project_id) / video_name
        if source_video.is_file():
            target_video = VIDEOS_DIR / f"{material_id}.mp4"
            shutil.copy2(source_video, target_video)
            video_rel = f"./videos/{target_video.name}"
            # Видео не отправляем при каждой публикации — на хостинге мало места.
            # Если нужно видео на сайте, загрузите его отдельным деплоем.

    material_steps: list[dict[str, Any]] = []
    deploy_files = ["published-lessons.json"]
    for index, step in enumerate(data.get("steps", []), start=1):
        step_images: list[dict[str, str]] = []
        for frame_index, frame in enumerate(storage.get_step_frames(step), start=1):
            asset_name = f"{material_id}_step_{index:02d}_{frame_index:02d}.png"
            rendered = render_annotated_image(
                project_id,
                frame["frameFile"],
                frame.get("annotations"),
                target_name=f"{step['id']}_{frame.get('id', frame_index)}",
            )
            shutil.copy2(rendered, ASSETS_DIR / asset_name)
            deploy_files.append(f"assets/{asset_name}")
            step_images.append(
                {
                    "image": f"./assets/{asset_name}",
                    "caption": step.get("comment", "") or step.get("title", ""),
                }
            )
        material_steps.append(
            {
                "title": step.get("title", f"Шаг {index}"),
                "why": step.get("why", ""),
                "action": step.get("action", ""),
                "result": step.get("result", ""),
                "image": step_images[0]["image"] if step_images else "",
                "images": step_images,
                "caption": step.get("comment", "") or step.get("title", ""),
            }
        )

    checklist = data.get("checklist") or [step.get("result", "") for step in data.get("steps", []) if step.get("result")]
    issues = data.get("issues") or []
    keywords = data.get("keywords") or ["инструкция", data.get("topic", "")]

    material = {
        "id": material_id,
        "topic": data.get("topic", "Без темы"),
        "title": data.get("title", "Новый урок"),
        "description": data.get("description", ""),
        "role": data.get("role", "Склад / оператор"),
        "duration": data.get("duration", ""),
        "sourceVideo": video_rel,
        "videoNote": data.get("videoNote", "Исходное видео приложено к материалу."),
        "keywords": keywords,
        "steps": material_steps,
        "checklist": checklist,
        "issues": issues,
    }

    updated = [item for item in existing if item.get("id") != material_id]
    updated.append(material)
    _save_published(updated)

    data["status"] = "published"
    data["statusMessage"] = f"Опубликовано в учебной базе: {material_id}"
    data["publishedId"] = material_id
    storage.save_project(data)

    deploy_result = auto_deploy(material_id, deploy_files)
    status_message = deploy_result.get("message") or f"Опубликовано: {material_id}"
    data["statusMessage"] = status_message
    storage.save_project(data)

    return {
        "materialId": material_id,
        "sitePath": str(PUBLISHED_FILE.relative_to(SITE_ROOT.parent)),
        "steps": len(material_steps),
        "url": deploy_result.get("url") or f"https://nostradamus-1503.ru/obuchenie/?lesson={material_id}",
        "deployed": deploy_result.get("deployed", False),
        "message": status_message,
    }
