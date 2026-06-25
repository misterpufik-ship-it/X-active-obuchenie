from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE_VIDEOS = ROOT / "site" / "videos"
VIDEOS = ROOT / "Videos"

MAPPING = [
    ("*Селсап*", ROOT / "Videos", "wb-selsup-supply.mp4"),
    ("*селсап*", ROOT / "Videos", "wb-selsup-supply.mp4"),
    ("*объедин*", ROOT / "Videos", "merge-supply-card.mp4"),
]


def main() -> None:
    SITE_VIDEOS.mkdir(parents=True, exist_ok=True)

    for pattern, folder, target in MAPPING:
        matches = sorted(folder.glob(pattern)) if folder.is_dir() else []
        if matches:
            shutil.copy2(matches[0], SITE_VIDEOS / target)
            print(f"copied {matches[0].name} -> site/videos/{target}")
        else:
            print(f"warning: no match for {pattern}")

    source = ROOT / "source_video.mp4"
    if source.is_file():
        shutil.copy2(source, SITE_VIDEOS / "honest-sign-base.mp4")
        print("copied source_video.mp4 -> site/videos/honest-sign-base.mp4")

    ozon_explicit = Path(
        r"C:\Users\mrpuf\OneDrive\Рабочий стол\X-active Obuchenie\Videos\Видео_инструкция_поставка_на_озон.mp4"
    )
    if ozon_explicit.is_file():
        shutil.copy2(ozon_explicit, SITE_VIDEOS / "ozon-supply.mp4")
        print("copied ozon video -> site/videos/ozon-supply.mp4")
    elif (SITE_VIDEOS / "ozon-supply.mp4").is_file():
        print("ozon video already in site/videos")


if __name__ == "__main__":
    main()
