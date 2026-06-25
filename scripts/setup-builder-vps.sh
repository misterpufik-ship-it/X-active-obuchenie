#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/srv/deploy/projects/x-active-obuchenie"
REPO="${PROJECT_ROOT}/repo"
VENV="${PROJECT_ROOT}/venv"
SERVICE="x-active-lesson-builder"
NGINX_SNIPPET="/etc/nginx/snippets/x-active-builder.conf"

cd "${REPO}"
git fetch origin
git checkout main
git pull --ff-only origin main

python3 -m venv "${VENV}"
"${VENV}/bin/pip" install --upgrade pip
"${VENV}/bin/pip" install -r lesson_builder/requirements.txt

install -d -o deploy -g deploy "${REPO}/lesson_builder/projects"
install -m 644 deploy/lesson-builder.service "/etc/systemd/system/${SERVICE}.service"

cat > "${NGINX_SNIPPET}" <<'EOF'
location /x-active-builder/ {
    auth_basic off;
    proxy_pass http://127.0.0.1:8765/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 1024m;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
}
EOF

OPENCLAW="/etc/nginx/sites-enabled/openclaw"
if ! grep -q 'x-active-builder.conf' "${OPENCLAW}"; then
  sed -i '/location \/ {/i \    include /etc/nginx/snippets/x-active-builder.conf;' "${OPENCLAW}"
fi

systemctl daemon-reload
systemctl enable "${SERVICE}"
systemctl restart "${SERVICE}"
nginx -t
systemctl reload nginx

echo "Lesson builder: https://posoolonono.beget.app/x-active-builder/"
