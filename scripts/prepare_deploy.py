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


if __name__ == "__main__":
    main()
