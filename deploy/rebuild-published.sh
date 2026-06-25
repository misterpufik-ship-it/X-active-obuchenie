#!/usr/bin/env bash
set -euo pipefail
cd /srv/deploy/projects/x-active-obuchenie/repo
../venv/bin/python -m lesson_builder.rebuild_published --deploy
