#!/bin/bash
# Script para iniciar backend y frontend en Linux/Mac
# Uso: ./scripts/start-dev.sh

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  🚀 INICIANDO LABORATORIO TÉRMICO ITM    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

ROOT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Verificar directorios
if [ ! -d "$ROOT_PATH/apps/backend" ]; then
    echo "❌ Error: No se encuentra $ROOT_PATH/apps/backend"
    exit 1
fi

if [ ! -d "$ROOT_PATH/apps/frontend" ]; then
    echo "❌ Error: No se encuentra $ROOT_PATH/apps/frontend"
    exit 1
fi

echo "📍 Directorio raíz: $ROOT_PATH"
echo ""

# Backend
echo "═══════════════════════════════════════════"
echo "  🐍 INICIANDO BACKEND (Puerto 5000)"
echo "═══════════════════════════════════════════"
echo ""

cd "$ROOT_PATH/apps/backend"
echo "📍 $(pwd)"

if [ -x ".venv/bin/python" ]; then
    PYTHON=".venv/bin/python"
else
    echo "⚠️  No se encontró .venv; usando python3 del PATH"
    PYTHON="python3"
fi

echo "✓ Backend iniciándose..."

"$PYTHON" app.py &
BACKEND_PID=$!

sleep 3

# Frontend
echo ""
echo "═══════════════════════════════════════════"
echo "  ⚡ INICIANDO FRONTEND (Puerto 5173)"
echo "═══════════════════════════════════════════"
echo ""

cd "$ROOT_PATH/apps/frontend"
echo "📍 $(pwd)"
echo "✓ Frontend iniciándose..."

npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✅ SERVICIOS EN EJECUCIÓN                ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "🔗 Acceso:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:5000"
echo ""
echo "📝 PIDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "⏹️  Presiona Ctrl+C para detener"
echo ""

# Esperar a que terminen
wait $BACKEND_PID $FRONTEND_PID
