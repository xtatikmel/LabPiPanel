# Guía de ejecución

Esta guía cubre el monorepo `apps/` (backend Flask + frontend React). Para la
versión antigua de la raíz, consulta `docs/archive/`.

## 1. Requisitos

- Python 3.10+ (probado con 3.14)
- Node.js 20.19+ y npm 10+
- Git

Verifica las versiones:

```bash
python --version
node --version
npm --version
```

## 2. Obtener el código

```bash
git clone https://github.com/xtatikmel/LabPiPanel.git
cd LabPiPanel
```

## 3. Backend

```bash
cd apps/backend

python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

Arranca el servidor:

```bash
python app.py
```

Salida esperada:

```
Laboratorio Térmico ITM - Servidor Backend
 * Running on http://0.0.0.0:5000
```

Comprueba que responde:

```bash
curl http://localhost:5000/api/status
```

### Puerto e interfaz

```bash
# Linux / macOS
PORT=8080 python app.py

# Windows PowerShell
$env:PORT=8080; python app.py
```

El backend escucha en `0.0.0.0` por defecto, por lo que es accesible desde la
LAN y desde Tailscale.

## 4. Frontend en desarrollo

En otra terminal:

```bash
cd apps/frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

Vite redirige las peticiones `/api` al backend (`http://127.0.0.1:5000` por
defecto). Si el backend está en otra máquina:

```bash
# Linux / macOS
VITE_DEV_API_TARGET=http://192.168.1.50:5000 npm run dev

# Windows PowerShell
$env:VITE_DEV_API_TARGET="http://192.168.1.50:5000"; npm run dev
```

## 5. Producción en un solo puerto

```bash
cd apps/frontend
npm run build

cd ../backend
python app.py
```

Abre `http://<IP_DEL_EQUIPO>:5000`.

- Flask sirve `apps/frontend/dist` en `/`.
- Las rutas desconocidas devuelven `index.html` (fallback SPA).
- Las rutas `/api/*` desconocidas devuelven `404` JSON, no el index.
- Si `dist/` no existe, `/` devuelve `503` con un mensaje claro.

## 6. Raspberry Pi

1. Instala Python, Node y las dependencias.
2. Compila el frontend en la Pi o copia `apps/frontend/dist` desde tu equipo.
3. Arranca el backend con `HOST=0.0.0.0`.
4. Abre `http://<IP_DE_LA_PI>:5000`.
5. Si usas Tailscale, no cambies `VITE_API_BASE`: al servirse todo desde el
   mismo origen, funciona con la IP de Tailscale.

Para acceso desde otro equipo sin compilar en la Pi:

```bash
# En tu equipo
cd apps/frontend
npm run build
scp -r dist pi@<IP_PI>:~/LabPiPanel/apps/frontend/
```

## 7. Docker

```bash
docker compose up --build
```

La imagen compila el frontend y lo sirve con Flask en el puerto `5000`. En
Raspberry Pi necesitarás los dispositivos y permisos indicados en
`docker-compose.yml`.

## 8. Pruebas

```bash
cd apps/backend
pip install -r requirements-dev.txt
python -m pytest

cd ../frontend
npm run build
npm run lint
```

Detalle en [TESTING.md](TESTING.md).

## 9. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Address already in use` | Otro proceso en el puerto 5000 | `PORT=5001 python app.py` o detén el proceso |
| `/` devuelve `503` | Frontend sin compilar | `cd apps/frontend && npm run build` |
| La UI carga pero no hay datos | Proxy de Vite o backend caído | Verifica `http://localhost:5000/api/status` y `VITE_DEV_API_TARGET` |
| `CORS` bloqueado | Frontend y backend en orígenes distintos sin configuración | Usa el proxy de Vite o define `VITE_API_BASE` |
| `ModuleNotFoundError: flask` | Venv no activado | Activa `.venv` e instala `requirements.txt` |
| `npm run build` falla por tipos | Error de TypeScript | Ejecuta `npx tsc -b` para ver el detalle |
| pytest falla con `PermissionError` en Windows | Directorio temporal de pytest sin permisos | Los tests usan `tempfile`, no `tmp_path`; actualiza el repo |
| Los relés no responden en la Pi | Pines o lógica incorrectos | Ver tabla de hardware en el README |

## 10. Verificación rápida

```bash
curl -s http://localhost:5000/api/status
curl -s http://localhost:5000/api/config
curl -s http://localhost:5000/api/live-data/json
```

Los tres deben devolver `200` con JSON válido.
