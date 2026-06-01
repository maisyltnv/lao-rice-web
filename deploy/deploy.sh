#!/bin/bash
set -euo pipefail

APP_DIR="/opt/lao-rice-web"
SERVICE="lao-rice-web"
GITHUB_KEY="${GITHUB_KEY:-$HOME/.ssh/github_lao_rice_web}"
API_URL="${NEXT_PUBLIC_API_URL:-http://127.0.0.1:8081}"
WEB_PORT="${PORT:-3000}"

cd "$APP_DIR"

if [ -f "$GITHUB_KEY" ]; then
  export GIT_SSH_COMMAND="ssh -i $GITHUB_KEY -o StrictHostKeyChecking=accept-new"
fi

echo "==> Pull latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Ensure production env"
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
PORT=${WEB_PORT}
EOF

echo "==> Install dependencies"
npm ci

echo "==> Build Next.js"
npm run build

echo "==> Restart service"
systemctl restart "$SERVICE"
sleep 3
systemctl is-active --quiet "$SERVICE"

echo "==> Health check"
curl -sf "http://127.0.0.1:${WEB_PORT}/admin/login" >/dev/null
echo "Deploy OK"
