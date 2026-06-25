"""Flask server for the local lesson builder."""

from __future__ import annotations

import mimetypes
import threading
import traceback
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_file, send_from_directory

from . import export, pipeline, publish, storage
from .ffmpeg_util import find_binary

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"

app = Flask(__name__, static_folder=str(STATIC), static_url_path="/static")
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024  # 1 GB


@app.get("/")
def index():
    return send_from_directory(STATIC, "index.html")


@app.get("/api/health")
def api_health():
    ffmpeg = find_binary("ffmpeg")
    ffprobe = find_binary("ffprobe")
    whisper_ok = False
    try:
        import faster_whisper  # noqa: F401

        whisper_ok = True
    except ImportError:
        whisper_ok = False

    return jsonify(
        {
            "localOnly": True,
            "ffmpeg": ffmpeg,
            "ffprobe": ffprobe,
            "ffmpegReady": bool(ffmpeg and ffprobe),
            "whisperReady": whisper_ok,
        }
    )


@app.get("/api/projects")
def api_list_projects():
    return jsonify(storage.list_projects())


@app.post("/api/projects")
def api_create_project():
    payload = request.get_json(silent=True) or {}
    project = storage.new_project(
        title=(payload.get("title") or "Новый урок").strip(),
        topic=(payload.get("topic") or "Без темы").strip(),
    )
    return jsonify(project), 201


@app.get("/api/projects/<project_id>")
def api_get_project(project_id: str):
    try:
        return jsonify(storage.load_project(project_id))
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404


@app.put("/api/projects/<project_id>")
def api_update_project(project_id: str):
    try:
        current = storage.load_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404

    payload = request.get_json(silent=True) or {}
    for key in (
        "title",
        "topic",
        "description",
        "role",
        "duration",
        "videoNote",
        "keywords",
        "checklist",
        "issues",
        "steps",
    ):
        if key in payload:
            current[key] = payload[key]
    return jsonify(storage.save_project(current))


@app.post("/api/projects/<project_id>/save")
def api_save_project(project_id: str):
    try:
        data = storage.load_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404
    return jsonify(storage.save_project(data))


@app.post("/api/projects/<project_id>/publish")
def api_publish_project(project_id: str):
    try:
        result = publish.publish_to_site(project_id)
        return jsonify(result)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404
    except Exception as exc:  # noqa: BLE001
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500


@app.delete("/api/projects/<project_id>")
def api_delete_project(project_id: str):
    folder = storage.project_dir(project_id)
    if folder.is_dir():
        import shutil

        shutil.rmtree(folder, ignore_errors=True)
    return jsonify({"ok": True})


@app.post("/api/projects/<project_id>/upload")
def api_upload_video(project_id: str):
    try:
        data = storage.load_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404

    file = request.files.get("video")
    if not file or not file.filename:
        return jsonify({"error": "Выберите видеофайл."}), 400

    suffix = Path(file.filename).suffix.lower() or ".mp4"
    if suffix not in {".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"}:
        return jsonify({"error": "Поддерживаются mp4, mov, mkv, webm, avi."}), 400

    paths = storage.ensure_dirs(project_id)
    target = paths["root"] / f"source{suffix}"
    file.save(target)

    data["videoFile"] = target.name
    data["status"] = "uploaded"
    data["statusMessage"] = f"Видео загружено: {file.filename}"
    storage.save_project(data)
    return jsonify(data)


_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}


def _save_step_image(project_id: str, data: dict, file_bytes: bytes, suffix: str, *, label: str) -> dict:
    paths = storage.ensure_dirs(project_id)
    uploads_dir = paths["uploads"]
    uploads_dir.mkdir(parents=True, exist_ok=True)

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    existing = len(list(uploads_dir.glob(f"manual_*{suffix}")))
    filename = f"manual_{stamp}_{existing + 1:02d}{suffix}"
    target = uploads_dir / filename
    target.write_bytes(file_bytes)

    rel = storage.rel_path(project_id, target)
    frame_entry = {"file": rel, "time": label, "source": "manual"}
    frames = data.get("availableFrames") or []
    if not any(item.get("file") == rel for item in frames):
        frames.append(frame_entry)
    data["availableFrames"] = frames
    return {"file": rel, "label": label}


@app.post("/api/projects/<project_id>/upload-image")
def api_upload_image(project_id: str):
    try:
        data = storage.load_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404

    file = request.files.get("image")
    if not file or not file.filename:
        return jsonify({"error": "Выберите изображение."}), 400

    suffix = Path(file.filename).suffix.lower() or ".png"
    if suffix == ".jfif":
        suffix = ".jpg"
    if suffix not in _IMAGE_SUFFIXES:
        return jsonify({"error": "Поддерживаются PNG, JPG, WEBP, GIF, BMP."}), 400

    apply_step = (request.form.get("applyToStep") or "").strip()
    label = (request.form.get("label") or "вручную").strip() or "вручную"
    saved = _save_step_image(project_id, data, file.read(), suffix, label=label)

    if apply_step:
        for step in data.get("steps", []):
            if step.get("id") == apply_step:
                step["frameFile"] = saved["file"]
                break

    data["statusMessage"] = f"Изображение добавлено: {saved['file'].split('/')[-1]}"
    storage.save_project(data)
    return jsonify(data)


def _run_pipeline(project_id: str) -> None:
    try:
        pipeline.process_project(project_id)
    except Exception as exc:  # noqa: BLE001
        traceback.print_exc()
        try:
            data = storage.load_project(project_id)
            data["status"] = "error"
            data["statusMessage"] = str(exc)
            storage.save_project(data)
        except FileNotFoundError:
            pass


@app.post("/api/projects/<project_id>/process")
def api_process(project_id: str):
    try:
        data = storage.load_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Проект не найден"}), 404

    if not data.get("videoFile"):
        return jsonify({"error": "Сначала загрузите видео."}), 400
    if data.get("status") == "processing":
        return jsonify({"error": "Обработка уже выполняется."}), 409

    data["status"] = "processing"
    data["statusMessage"] = "Запуск обработки…"
    storage.save_project(data)
    threading.Thread(target=_run_pipeline, args=(project_id,), daemon=True).start()
    return jsonify({"ok": True})


@app.get("/api/projects/<project_id>/files/<path:rel_path>")
def api_project_file(project_id: str, rel_path: str):
    base = storage.project_dir(project_id).resolve()
    target = (base / rel_path).resolve()
    if not str(target).startswith(str(base)) or not target.is_file():
        return jsonify({"error": "Файл не найден"}), 404
    mime, _ = mimetypes.guess_type(str(target))
    return send_file(target, mimetype=mime or "application/octet-stream")


@app.post("/api/projects/<project_id>/export/html")
def api_export_html(project_id: str):
    try:
        path = export.export_html(project_id)
        return send_file(path, as_attachment=True, download_name="instruction.html")
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500


@app.post("/api/projects/<project_id>/export/pdf")
def api_export_pdf(project_id: str):
    try:
        path = export.export_pdf(project_id)
        return send_file(path, as_attachment=True, download_name="instruction.pdf")
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500


@app.get("/api/projects/<project_id>/export/snippet")
def api_export_snippet(project_id: str):
    try:
        snippet = export.export_app_js_snippet(project_id)
        return jsonify({"snippet": snippet})
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500


def main() -> None:
    storage.PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    print("Разработка урока: http://127.0.0.1:8765")
    app.run(host="127.0.0.1", port=8765, debug=False, threaded=True)


if __name__ == "__main__":
    main()
