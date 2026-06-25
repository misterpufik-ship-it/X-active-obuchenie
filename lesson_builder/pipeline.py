"""Video → transcript → steps → frames pipeline."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from PIL import Image

from . import storage
from .ffmpeg_util import require_ffmpeg, run


ACTION_WORDS = (
    "открой",
    "открыва",
    "нажм",
    "перей",
    "переход",
    "выбер",
    "загруз",
    "скач",
    "встав",
    "копир",
    "сохран",
    "провер",
    "найд",
    "верн",
    "создай",
    "заполн",
    "отмет",
    "распечат",
    "печат",
    "скани",
    "введ",
    "укаж",
    "выгруз",
)


def _average_hash(image_path: Path, size: int = 16) -> str:
    img = Image.open(image_path).convert("L").resize((size, size))
    pixels = list(img.getdata())
    avg = sum(pixels) / len(pixels)
    return "".join("1" if px > avg else "0" for px in pixels)


def _hamming(a: str, b: str) -> int:
    return sum(x != y for x, y in zip(a, b))


def probe_duration(video_path: Path) -> float:
    _, ffprobe = require_ffmpeg()
    result = run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
    )
    return float(result.stdout.strip() or 0)


def extract_audio(video_path: Path, audio_path: Path) -> None:
    ffmpeg, _ = require_ffmpeg()
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "16000",
            "-ac",
            "1",
            str(audio_path),
        ]
    )


def transcribe_audio(audio_path: Path) -> dict[str, Any]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "Модуль faster-whisper не установлен. Выполните: pip install -r lesson_builder/requirements.txt"
        ) from exc

    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments_iter, info = model.transcribe(str(audio_path), language="ru", vad_filter=True)

    segments: list[dict[str, Any]] = []
    parts: list[str] = []
    for segment in segments_iter:
        text = segment.text.strip()
        if not text:
            continue
        segments.append({"start": round(segment.start, 2), "end": round(segment.end, 2), "text": text})
        parts.append(text)

    return {
        "language": info.language or "ru",
        "duration": round(info.duration, 2) if info.duration else 0,
        "fullText": " ".join(parts),
        "segments": segments,
    }


def _looks_like_action(text: str) -> bool:
    lower = text.lower()
    return any(word in lower for word in ACTION_WORDS)


def _title_from_text(text: str, index: int) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip(" .,")
    if not cleaned:
        return f"Шаг {index}"
    sentence = re.split(r"[.!?]", cleaned)[0].strip()
    if len(sentence) > 72:
        sentence = sentence[:69].rstrip() + "…"
    return sentence[0].upper() + sentence[1:] if sentence else f"Шаг {index}"


def split_into_steps(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not segments:
        return []

    groups: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []

    for index, segment in enumerate(segments):
        current.append(segment)
        next_segment = segments[index + 1] if index + 1 < len(segments) else None
        pause = (next_segment["start"] - segment["end"]) if next_segment else 0
        combined = " ".join(item["text"] for item in current)
        word_count = len(combined.split())

        should_split = False
        if next_segment is None:
            should_split = True
        elif pause >= 2.4 and word_count >= 8:
            should_split = True
        elif word_count >= 34:
            should_split = True
        elif pause >= 1.2 and _looks_like_action(next_segment["text"]) and word_count >= 12:
            should_split = True

        if should_split:
            groups.append(current)
            current = []

    steps: list[dict[str, Any]] = []
    for index, group in enumerate(groups, start=1):
        text = " ".join(item["text"] for item in group).strip()
        start = group[0]["start"]
        end = group[-1]["end"]
        action_sentences = re.split(r"(?<=[.!?])\s+", text)
        action = action_sentences[0].strip() if action_sentences else text
        comment = text if len(text) > len(action) + 12 else ""
        steps.append(
            {
                "id": f"step-{index:02d}",
                "number": index,
                "title": _title_from_text(text, index),
                "action": action,
                "comment": comment,
                "result": "Действие выполнено, можно переходить к следующему шагу.",
                "why": "Этот шаг нужен для корректного выполнения процесса без ошибок.",
                "timeStart": start,
                "timeEnd": end,
                "frameTime": round((start + end) / 2, 2),
                "frameFile": "",
                "annotatedFile": "",
                "annotations": [],
            }
        )
    return steps


def extract_frames(video_path: Path, frames_dir: Path, *, interval: float = 2.0) -> list[dict[str, Any]]:
    ffmpeg, _ = require_ffmpeg()
    frames_dir.mkdir(parents=True, exist_ok=True)
    pattern = frames_dir / "frame_%04d.png"
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(video_path),
            "-vf",
            f"fps=1/{interval}",
            "-q:v",
            "2",
            str(pattern),
        ]
    )

    frames: list[dict[str, Any]] = []
    duration = probe_duration(video_path)
    for index, frame_path in enumerate(sorted(frames_dir.glob("frame_*.png")), start=1):
        time_sec = round((index - 1) * interval, 2)
        if duration and time_sec > duration:
            time_sec = duration
        frames.append({"file": frame_path.name, "time": time_sec, "path": frame_path})
    return frames


def dedupe_frames(frames: list[dict[str, Any]], unique_dir: Path, *, threshold: int = 6) -> list[dict[str, Any]]:
    unique_dir.mkdir(parents=True, exist_ok=True)
    kept: list[dict[str, Any]] = []
    hashes: list[str] = []

    for frame in frames:
        source = frame["path"]
        digest = _average_hash(source)
        if any(_hamming(digest, old) <= threshold for old in hashes):
            continue
        target_name = f"uniq_{len(kept) + 1:03d}.png"
        target = unique_dir / target_name
        Image.open(source).convert("RGB").save(target, optimize=True)
        kept.append({"file": target_name, "time": frame["time"], "path": target})
        hashes.append(digest)
    return kept


def _nearest_frame(frames: list[dict[str, Any]], timestamp: float) -> dict[str, Any] | None:
    if not frames:
        return None
    return min(frames, key=lambda frame: abs(frame["time"] - timestamp))


def match_steps_to_frames(steps: list[dict[str, Any]], frames: list[dict[str, Any]]) -> None:
    used: set[str] = set()
    for step in steps:
        target_time = step.get("frameTime", 0)
        ranked = sorted(frames, key=lambda frame: abs(frame["time"] - target_time))
        chosen = None
        for candidate in ranked:
            if candidate["file"] not in used:
                chosen = candidate
                break
        if chosen is None:
            chosen = _nearest_frame(frames, target_time)
        if chosen:
            step["frameFile"] = f"frames_unique/{chosen['file']}"
            step["frameTime"] = chosen["time"]
            used.add(chosen["file"])


def estimate_duration(steps: list[dict[str, Any]]) -> str:
    if not steps:
        return "—"
    minutes = max(1, round(len(steps) * 1.5))
    return f"{minutes}-{minutes + 5} минут"


def process_project(project_id: str) -> dict[str, Any]:
    data = storage.load_project(project_id)
    paths = storage.ensure_dirs(project_id)
    video_name = data.get("videoFile")
    if not video_name:
        raise RuntimeError("Сначала загрузите видеофайл.")

    video_path = paths["root"] / video_name
    if not video_path.is_file():
        raise RuntimeError("Видеофайл не найден на диске.")

    storage.update_status(project_id, "processing", "Извлекаем аудио…")
    audio_path = paths["audio"] / "audio.wav"
    extract_audio(video_path, audio_path)

    storage.update_status(project_id, "processing", "Распознаём речь…")
    transcript = transcribe_audio(audio_path)
    data["transcript"] = transcript

    storage.update_status(project_id, "processing", "Делим текст на шаги…")
    steps = split_into_steps(transcript.get("segments", []))
    data["steps"] = steps
    data["duration"] = estimate_duration(steps)

    storage.update_status(project_id, "processing", "Извлекаем кадры из видео…")
    raw_frames = extract_frames(video_path, paths["frames"], interval=2.0)

    storage.update_status(project_id, "processing", "Убираем похожие кадры…")
    unique_frames = dedupe_frames(raw_frames, paths["frames_unique"])
    data["availableFrames"] = [
        {"file": storage.rel_path(project_id, frame["path"]), "time": frame["time"]} for frame in unique_frames
    ]

    storage.update_status(project_id, "processing", "Сопоставляем шаги и скриншоты…")
    match_steps_to_frames(data["steps"], unique_frames)

    data["status"] = "ready"
    data["statusMessage"] = f"Готово: {len(data['steps'])} шагов, {len(unique_frames)} уникальных кадров."
    return storage.save_project(data)
