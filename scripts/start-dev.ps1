# Script para iniciar backend y frontend en desarrollo local
# Uso: .\scripts\start-dev.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 INICIANDO LABORATORIO TÉRMICO ITM     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Verificar que los directorios existan
if (-not (Test-Path "$rootPath\apps\backend")) {
    Write-Host "❌ Error: No se encuentra $rootPath\apps\backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$rootPath\apps\frontend")) {
    Write-Host "❌ Error: No se encuentra $rootPath\apps\frontend" -ForegroundColor Red
    exit 1
}

Write-Host "📍 Directorio raíz: $rootPath" -ForegroundColor Yellow
Write-Host ""

# Terminal 1: Backend
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🐍 INICIANDO BACKEND (Puerto 5000)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

cd "$rootPath\apps\backend"
Write-Host "📍 $((Get-Location).Path)" -ForegroundColor Yellow

# Iniciar backend en background
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$((Get-Location).Path)'; python app.py`"" -WindowStyle Normal

Write-Host "✓ Backend iniciándose..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Terminal 2: Frontend
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ⚡ INICIANDO FRONTEND (Puerto 5173)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

cd "$rootPath\apps\frontend"
Write-Host "📍 $((Get-Location).Path)" -ForegroundColor Yellow

# Iniciar frontend en background
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$((Get-Location).Path)'; npm run dev`"" -WindowStyle Normal

Write-Host "✓ Frontend iniciándose..." -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ SERVICIOS EN INICIO                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Acceso:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Yellow
Write-Host "   Ve a las nuevas ventanas de PowerShell para ver logs" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Cierra las ventanas para detener los servicios" -ForegroundColor Yellow
Write-Host ""
