#!/bin/bash
set -euo pipefail

APP_DIR="/opt/lao-rice-web"
REPO="git@github.com:maisyltnv/lao-rice-web.git"
if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
  _DEPLOY_HOME="$(getent passwd "$SUDO_USER" | cut -d: -f6)"
else
  _DEPLOY_HOME="${HOME}"
fi
GITHUB_KEY="${GITHUB_KEY:-${_DEPLOY_HOME}/.ssh/github_lao_rice_web}"
API_URL="${NEXT_PUBLIC_API_URL:-http://62.171.159.75:8081}"
case "$API_URL" in
  *127.0.0.1*|*localhost*) API_URL="http://62.171.159.75:8081" ;;
esac
WEB_PORT="${PORT:-3000}"

setup_git_ssh() {
  if [ ! -f "$GITHUB_KEY" ]; then
    echo ""
    echo "ERROR: Deploy key not found: $GITHUB_KEY"
    echo ""
    echo "Run on VPS (as deploy user):"
    echo "  ssh-keygen -t ed25519 -f $GITHUB_KEY -N \"\""
    echo "  cat ${GITHUB_KEY}.pub"
    echo ""
    echo "Add the public key at:"
    echo "  https://github.com/maisyltnv/lao-rice-web/settings/keys"
    echo ""
    exit 1
  fi
  export GIT_SSH_COMMAND="ssh -i $GITHUB_KEY -o StrictHostKeyChecking=accept-new"
}

install_node() {
  if command -v node >/dev/null 2>&1 && node -v | grep -q 'v20'; then
    return
  fi
  echo "==> Install Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
}

echo "==> Install packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git curl ufw
install_node
node -v
npm -v

echo "==> Clone or update repo"
setup_git_ssh
mkdir -p /opt
if [ ! -d "$APP_DIR/.git" ]; then
  git clone -b main "$REPO" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
fi
cd "$APP_DIR"
chmod +x deploy/deploy.sh

echo "==> Create production env"
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
PORT=${WEB_PORT}
EOF

echo "==> Install dependencies and build"
npm ci
export NEXT_PUBLIC_API_URL="${API_URL}"
export PORT="${WEB_PORT}"
npm run build

DEPLOY_USER="${SUDO_USER:-deploy}"
if [ "$DEPLOY_USER" = "root" ]; then DEPLOY_USER="deploy"; fi
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

echo "==> Install systemd service"
cp deploy/lao-rice-web.service /etc/systemd/system/lao-rice-web.service
systemctl daemon-reload
systemctl enable lao-rice-web
systemctl restart lao-rice-web

echo "==> Firewall"
ufw allow OpenSSH || true
ufw allow "${WEB_PORT}/tcp" || true
ufw --force enable || true

echo "==> Health check"
sleep 3
curl -sf "http://127.0.0.1:${WEB_PORT}/admin/login" >/dev/null
echo ""
PUBLIC_IP="$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "Setup complete."
echo "Store: http://${PUBLIC_IP}:${WEB_PORT}"
echo "Admin: http://${PUBLIC_IP}:${WEB_PORT}/admin/login"
echo "API URL in build: ${API_URL}"
