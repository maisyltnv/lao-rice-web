#!/bin/bash
set -euo pipefail

APP_DIR="/opt/lao-rice-web"
SERVICE="lao-rice-web"
GITHUB_KEY="${GITHUB_KEY:-$HOME/.ssh/github_lao_rice_web}"
WEB_PORT="${PORT:-3000}"

cd "$APP_DIR"
chmod +x deploy/deploy.sh 2>/dev/null || true

# Browser must call the public API host (never 127.0.0.1 from vps-setup).
if [ -n "${NEXT_PUBLIC_API_URL:-}" ]; then
  API_URL="$NEXT_PUBLIC_API_URL"
elif [ -f .env.production ]; then
  API_URL="$(grep -E '^NEXT_PUBLIC_API_URL=' .env.production | head -1 | cut -d= -f2- || true)"
fi
API_URL="${API_URL:-http://62.171.159.75:8081}"
case "$API_URL" in
  *127.0.0.1*|*localhost*) API_URL="http://62.171.159.75:8081" ;;
esac

if [ -f "$GITHUB_KEY" ]; then
  export GIT_SSH_COMMAND="ssh -i $GITHUB_KEY -o StrictHostKeyChecking=accept-new"
fi

echo "==> Pull latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Ensure production env (API_URL=${API_URL})"
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
PORT=${WEB_PORT}
EOF

echo "==> Install dependencies"
# Avoid EACCES when ~/.npm was previously written by root (sudo npm).
export NPM_CONFIG_CACHE="${APP_DIR}/.npm-cache"
mkdir -p "$NPM_CONFIG_CACHE"
if [ -d "${HOME}/.npm" ] && [ ! -w "${HOME}/.npm" ]; then
  echo "WARN: fixing ownership on ${HOME}/.npm"
  sudo chown -R "$(id -u):$(id -g)" "${HOME}/.npm" 2>/dev/null || true
fi
npm ci

echo "==> Build Next.js"
npm run build

echo "==> Restart service"
sudo systemctl restart "$SERVICE"
sleep 3
sudo systemctl is-active --quiet "$SERVICE"

echo "==> Health check"
curl -sf "http://127.0.0.1:${WEB_PORT}/admin/login" >/dev/null
echo "Deploy OK"
