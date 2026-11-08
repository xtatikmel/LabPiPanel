# LabPiPanel

Sistema de control y adquisición de datos para el laboratorio térmico del
**Instituto Tecnológico Metropolitano (ITM)**.

El proyecto está organizado como monorepo:

```
LabPiPanel/
├── apps/
│   ├── backend/          # API Flask + adquisición + grabación + alertas
│   └── frontend/         # React 19 + TypeScript + Vite + Tailwind
├── docs/                 # Documentación vigente
│   └── archive/          # Documentación histórica (no usar como referencia)
├── scripts/              # Arranque en desarrollo
├── Makefile              # Atajos para instalar, probar y ejecutar
├── Dockerfile            # Imagen de producción (frontend + backend)
└── docker-compose.yml
```

## Estado actual

- **`apps/` es la fuente de verdad.** El backend arranca, responde la API y sirve
  el frontend compilado en un solo puerto.
- **El hardware está simulado por defecto** (`DAQReader`, `FuenteXLN` y
  `GPIOController` generan datos ficticios). Los drivers reales todavía no se
  portaron desde la raíz.
- La implementación antigua de la raíz (`labpipanel.py`, `thermal_experiment.py`,
  `daq_usb5203.py`, etc.) se conserva como referencia, pero **está congelada**.
- No hay endpoints de experimentos en el monorepo todavía.

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.10 o superior |
| Node.js | 20.19 o superior |
| npm | 10 o superior |

## Inicio rápido (desarrollo)

### 1. Backend

```bash
cd apps/backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

La API queda en `http://localhost:5000`.

### 2. Frontend

En otra terminal:

```bash
cd apps/frontend
npm install
npm run dev
```

La interfaz queda en `http://localhost:5173`. Vite redirige `/api` al backend,
así que no hace falta configurar URLs absolutas.

También puedes arrancar ambos con:

```bash
# Linux / macOS
./scripts/start-dev.sh

# Windows (PowerShell)
.\scripts\start-dev.ps1
```

## Producción (un solo puerto)

```bash
cd apps/frontend
npm run build

cd ../backend
python app.py
```

Abre `http://<IP_DEL_EQUIPO>:5000`. Flask sirve `apps/frontend/dist` y la API en
el mismo origen. Si el frontend no está compilado, `/` responde `503` con un
mensaje explicativo.

## Pruebas

### Backend

```bash
cd apps/backend
pip install -r requirements-dev.txt
python -m pytest
```

Cobertura actual: 15 tests de humo y regresión (API, configuración de alertas,
grabación, alertas y servido del frontend).

### Frontend

```bash
cd apps/frontend
npm run build     # incluye verificación de tipos (tsc -b)
npm run lint
```

## Variables de entorno

| Variable | Dónde | Por defecto | Descripción |
|---|---|---|---|
| `HOST` / `FLASK_HOST` | Backend | `0.0.0.0` | Interfaz de escucha |
| `PORT` / `FLASK_PORT` | Backend | `5000` | Puerto HTTP |
| `VITE_API_BASE` | Frontend (build) | `/api` | URL completa de la API si frontend y backend están separados |
| `VITE_DEV_API_TARGET` | Frontend (dev) | `http://127.0.0.1:5000` | Destino del proxy de Vite |

Ejemplo para un despliegue separado:

```bash
# apps/frontend/.env.local
VITE_API_BASE=http://192.168.1.50:5000/api
```

## Documentación

- [Guía de ejecución](docs/GUIA_EJECUCION.md)
- [Referencia de la API](docs/API.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Guía de pruebas](docs/TESTING.md)
- [Índice de documentación](docs/README.md)

## Hardware real (pendiente)

El monorepo todavía usa valores distintos a los del equipo real. Antes de
conectar instrumentación hay que portar los drivers y corregir:

| Parámetro | Monorepo | Equipo real |
|---|---|---|
| Puerto fuente XLN | `10001` | `5024` |
| Termopar | Tipo `T` | Tipo `K` |
| Pines de relés | `17/27/22/23` | `26/20/21/16` |
| Lógica de relés | Activa en alto | Activa en bajo |

Los drivers de referencia están en la raíz: `daq_usb5203.py`, `fuente_xln.py`,
`relay_controller.py` y `thermal_experiment.py`.

## Implementación legacy

`labpipanel.py` y los módulos de la raíz contienen la versión anterior con
hardware real y experimentos. Se mantienen solo como referencia histórica. No
se deben usar para nuevos desarrollos; consulta
[`docs/archive/`](docs/archive/) para el contexto.
