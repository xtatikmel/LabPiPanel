#!/usr/bin/env bash
################################################################################
# LabPiPanel - Instalación del monorepo (backend + frontend)
# Uso: bash scripts/install.sh
################################################################################

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/apps/backend"
FRONTEND="$ROOT/apps/frontend"
VENV="$BACKEND/.venv"

info() { printf '\033[0;34m[INFO]\033[0m %s\n' "$1"; }
ok()   { printf '\033[0;32m[OK]\033[0m %s\n' "$1"; }
fail() { printf '\033[0;31m[ERROR]\033[0m %s\n' "$1"; exit 1; }

command -v python3 >/dev/null 2>&1 || fail "Python 3 no está instalado"
command -v node >/dev/null 2>&1 || fail "Node.js no está instalado"
command -v npm >/dev/null 2>&1 || fail "npm no está instalado"

info "Directorio del proyecto: $ROOT"

info "Creando entorno virtual del backend..."
python3 -m venv "$VENV"

info "Instalando dependencias Python..."
"$VENV/bin/python" -m pip install --upgrade pip
"$VENV/bin/python" -m pip install -r "$BACKEND/requirements-dev.txt"
ok "Backend listo"

info "Instalando dependencias del frontend..."
cd "$FRONTEND"
npm ci
ok "Frontend listo"

echo ""
echo "Instalación completada."
echo ""
echo "Desarrollo:"
echo "  Terminal 1: cd apps/backend && .venv/bin/python app.py"
echo "  Terminal 2: cd apps/frontend && npm run dev"
echo "  O bien:     ./scripts/start-dev.sh"
echo ""
echo "Producción:"
echo "  cd apps/frontend && npm run build"
echo "  cd ../backend && .venv/bin/python app.py"
echo ""
echo "Tests:"
echo "  cd apps/backend && .venv/bin/python -m pytest"
