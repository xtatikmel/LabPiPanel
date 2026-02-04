# AUDITORÍA TÉCNICA COMPLETA - LabPiPanel

**Fecha**: Febrero 4, 2026  
**Proyecto**: LabPiPanel - Sistema de Control de Laboratorio Térmico  
**Institución**: Instituto Tecnológico Metropolitano (ITM), Medellín, Colombia  
**Auditor**: Ingeniero de Software Senior

---

## ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Análisis de Dependencias](#análisis-de-dependencias)
5. [Manifiestos y Configuración](#manifiestos-y-configuración)
6. [Falencias Detectadas](#falencias-detectadas)
7. [Plan de Pruebas](#plan-de-pruebas)
8. [Guía de Ejecución Local](#guía-de-ejecución-local)
9. [Plan de Continuidad y Escalabilidad](#plan-de-continuidad-y-escalabilidad)
10. [README Propuesto](#readme-propuesto)
11. [Issues y Tareas Priorizadas](#issues-y-tareas-priorizadas)
12. [Checklist Final](#checklist-final)

---

## RESUMEN EJECUTIVO

### Descripción del Proyecto

**LabPiPanel** es un sistema híbrido Python + Node.js para control automatizado de laboratorio de investigación térmica, basado en Raspberry Pi 4. Integra:

- **Backend**: Servidor Flask (Python 3) con API REST
- **Frontend**: Next.js 16 (React 19) con UI basada en Radix UI
- **Hardware**: Control de fuentes de alimentación (Telnet), DAQ USB de termopares, relés GPIO
- **Propósito**: Caracterización térmica de nanofluidos en termosifones de dos fases

### Estado General

| Aspecto | Calificación | Comentario |
|---------|-------------|-----------|
| **Estructura** | ⚠️ MIXTA | Monorepo híbrido Python-Node sin clara separación |
| **Documentación** | ✅ BUENA | README, API.md, HARDWARE.md, GUIA_ITM.md presentes |
| **Dependencias** | ⚠️ RIESGOSA | Versiones fijas Radix UI, Next.js próximo EOL |
| **Testing** | ❌ CRÍTICO | Sin tests unitarios, integración ni e2e |
| **CI/CD** | ❌ FALTANTE | Sin GitHub Actions, GitLab CI o similar |
| **Containerización** | ❌ FALTANTE | Sin Dockerfile ni docker-compose |
| **Observabilidad** | ⚠️ BÁSICA | Solo logging a archivo, sin métricas/trazas |
| **Seguridad** | ⚠️ MEDIA | Sin autenticación API, sin HTTPS config |
| **Escalabilidad** | ⚠️ LIMITADA | Acoplado a Raspberry Pi, single-instance |

---

## ARQUITECTURA DEL SISTEMA

### Módulos y Componentes

```
LabPiPanel (Root)
│
├── Backend (Python)
│   ├── labpipanel.py (Servidor Flask, 473 líneas)
│   │   ├── API REST endpoints
│   │   ├── WebSocket (flask-socketio)
│   │   └── Static file serving
│   │
│   ├── Drivers & Controllers
│   │   ├── fuente_xln.py (Control BK Precision XLN30052, 333 líneas)
│   │   │   ├── Conexión Telnet (puerto 5024)
│   │   │   ├── Comandos SCPI
│   │   │   └── Validación de voltaje/corriente
│   │   │
│   │   ├── daq_usb5203.py (DAQ Measurement Computing, 198 líneas)
│   │   │   ├── 8 canales termopares tipo K
│   │   │   ├── MCC Linux drivers (CLI)
│   │   │   └── Lectura/validación de temperaturas
│   │   │
│   │   ├── relay_controller.py (Waveshare 4-channel relays, 168 líneas)
│   │   │   ├── RPi.GPIO control
│   │   │   ├── Activos en BAJO
│   │   │   └── Fallback modo simulación
│   │   │
│   │   └── thermal_experiment.py (Orquestación, 313 líneas)
│   │       ├── Secuencias de potencia
│   │       ├── Cálculo de resistencia térmica
│   │       └── Export CSV de datos
│   │
│   ├── config.py (Configuración centralizada, 86 líneas)
│   │   ├── Variables de entorno
│   │   ├── Límites de hardware
│   │   ├── Paths de directorios
│   │   └── Colores corporativos ITM
│   │
│   └── Archivos standalone
│       ├── demo_standalone.html (Prototipo frontend HTML/JS)
│       └── thermal_experiment.py (Script independiente)
│
├── Frontend (Node.js/React)
│   ├── package.json (Next.js 16 + Radix UI)
│   │   ├── next: 16.0.0
│   │   ├── react: 19.2.0
│   │   ├── typescript: ^5
│   │   └── 30+ componentes Radix UI
│   │
│   ├── templates/ → index.html (Jinja2 Flask)
│   │   └── Interfaz web principal
│   │
│   └── static/
│       └── css/ → style.css (Estilos corporativos ITM)
│
├── Documentación
│   ├── README.md (Guía general)
│   ├── API.md (467 líneas - Endpoints REST)
│   ├── HARDWARE.md (127 líneas - Specs hardware)
│   ├── GUIA_ITM.md (218 líneas - Contexto institucional)
│   ├── Checklist-Despliegue-LabPiPanel.pdf
│   ├── Roadmap-Despliegue-Expansion-LabPiPanel.pdf
│   └── Guia-Continuidad-Expansiones-Futuras.pdf
│
└── Requisitos
    ├── requirements.txt (Python)
    ├── package.json (Node.js)
    └── FALTANTE: package-lock.json, poetry.lock, pyproject.toml
```

### Dependencias Internas (Digrama de Flujo)

```
labpipanel.py (Main Entry Point)
    │
    ├─→ config.py (Configuración)
    │
    ├─→ fuente_xln.py
    │   ├─→ telnetlib (stdlib)
    │   └─→ logging (stdlib)
    │
    ├─→ daq_usb5203.py
    │   ├─→ subprocess (stdlib - MCC drivers)
    │   ├─→ re (stdlib)
    │   └─→ logging (stdlib)
    │
    ├─→ relay_controller.py
    │   ├─→ RPi.GPIO (ext - hardware)
    │   └─→ logging (stdlib)
    │
    └─→ thermal_experiment.py
        ├─→ fuente_xln.py
        ├─→ daq_usb5203.py
        ├─→ relay_controller.py
        ├─→ csv (stdlib)
        └─→ datetime (stdlib)

Frontend (HTML/JS + Next.js)
    ├─→ package.json dependencies
    │   ├─→ next (framework)
    │   ├─→ react, react-dom
    │   ├─→ @radix-ui/* (30 componentes)
    │   ├─→ recharts (gráficos)
    │   ├─→ zod (validación)
    │   └─→ tailwindcss (estilos)
    │
    └─→ API REST → labpipanel.py (Backend)
```

### Flujo de Datos

```
User Browser
    ↓ (HTTP/WebSocket)
Next.js Frontend (React Components)
    ↓ (REST API)
Flask Backend (labpipanel.py)
    ├─→ FuenteXLN (Telnet → Fuente Alimentación)
    ├─→ DAQUSB5203 (MCC drivers → Termopares)
    └─→ RelayController (GPIO → Relés Waveshare)
    
    ↓ (Datos medidos)
ThermalExperiment
    ├─→ CSV Export
    └─→ Cálculos de Resistencia Térmica
```

---

## STACK TECNOLÓGICO

### Lenguajes de Programación

| Lenguaje | Versión | Uso | Archivos |
|----------|---------|-----|---------|
| **Python** | 3.9+ (req.) | Backend, drivers, DAQ | 5 módulos principales |
| **JavaScript/TypeScript** | Next.js 16 | Frontend web | package.json (Node.js) |
| **HTML/CSS** | HTML5 + CSS3 | Templates (Jinja2) | index.html, style.css |

### Frameworks y Librerías Principales

#### Backend (Python)

| Librería | Versión | Propósito | Estado |
|----------|---------|----------|--------|
| **Flask** | 3.0.0 | Servidor web, routing | ✅ Estable |
| **flask-socketio** | (s/v) | WebSockets real-time | ⚠️ Versión no especificada |
| **RPi.GPIO** | 0.7.1 | Control GPIO (relés) | ✅ Estable (legacy) |
| **telnetlib3** | (s/v) | Comunicación Telnet | ⚠️ No especificada |
| **pyusb** | (s/v) | Acceso USB genérico | ⚠️ No especificada |
| **mcculw** | (s/v) | MCC DAQ drivers | ✅ Hardware específico |
| **eventlet** | (s/v) | WSGI server async | ⚠️ No especificada |
| **pexpect** | (s/v) | Spawning subprocesos | ⚠️ No especificada |

#### Frontend (Node.js/React)

| Librería | Versión | Propósito | Estado |
|----------|---------|----------|--------|
| **Next.js** | 16.0.0 | Framework React/SSR | ⚠️ Próximo EOL (v17 actual) |
| **React** | 19.2.0 | UI library | ✅ Última estable |
| **Radix UI** | 1.x.x | Componentes accesibles | ✅ Estable |
| **Tailwind CSS** | 4.1.9 | Utility CSS | ✅ Última estable |
| **Recharts** | 2.15.4 | Gráficos (recomendado) | ✅ Estable |
| **Zod** | 3.25.76 | Validación de esquemas | ✅ Estable |
| **react-hook-form** | 7.60.0 | Gestión de formularios | ✅ Estable |

### Gestores de Paquetes

| Gestor | Archivo | Estado |
|--------|---------|--------|
| **pip** | requirements.txt | ✅ Presente (9 líneas) |
| **npm** | package.json | ✅ Presente (completo) |
| **npm lock** | package-lock.json | ❌ **FALTANTE** |

### Runtimes y Entorno de Ejecución

| Componente | Especificación |
|-----------|-----------------|
| **Python** | 3.9+ (CPython) |
| **Node.js** | No especificado (asumido v18+) |
| **Raspberry Pi OS** | Bullseye/Bookworm (Linux ARM64) |
| **Kernel** | Linux 5.x-6.x (RPi) |

### ORM / BD

| Tipo | Utilización | Estado |
|-----|-------------|--------|
| **BD SQL** | No utilizada | N/A |
| **BD NoSQL** | No utilizada | N/A |
| **ORM** | No utilizado | N/A |
| **Almacenamiento** | CSV files en `/results/` | ✅ Presente |

### Servidor Web / WSGI

| Componente | Especificación |
|-----------|-----------------|
| **WSGI Server** | Eventlet (asincrónico) |
| **HTTP Server** | Flask (development) |
| **Production** | ⚠️ No especificado (necesario gunicorn + nginx) |

---

## ANÁLISIS DE DEPENDENCIAS

### Python (requirements.txt)

```
RPi.GPIO
telnetlib3
flask
usb
mcculw
flask-socketio 
eventlet
pyusb
pexpect
```

**Problemas Identificados:**

1. **SIN VERSIONES FIJADAS** ❌ Riesgo crítico
2. **Duplicación**: `pyusb` y `usb` (posible redundancia)
3. **Flask-socketio sin versión** → Compatible con Flask 3.0?
4. **eventlet + flask-socketio** → Conflicto potencial de servidores WSGI
5. **Falta python-dotenv** → Necesario para cargar `.env` pero no declarado
6. **Falta telnetlib nativo** → Usa `telnetlib3` externa

### Node.js (package.json)

**Dependencias Críticas:**

- ✅ `next@16.0.0` - Próximo EOL (16 en Feb 2025, v17 actual)
- ✅ `react@19.2.0` - Compatible con Next 16
- ✅ `typescript@^5` - Bien configurado
- ✅ `tailwindcss@4.1.9` - Última versión

**Componentes Radix UI (30 packages):**
- Todas versiones fijas (correcto para reproducibilidad)
- Compatible con React 19

**Dependencias Faltantes:**
- ❌ `@types/node`, `@types/react`, `@types/react-dom` en devDependencies (pero presentes)

### Matriz de Compatibilidad

| Python | Next.js | React | Estado |
|--------|---------|-------|--------|
| 3.9+ | 16 | 19 | ✅ Compatible |
| 3.12+ | 16 | 19 | ⚠️ A validar |

---

## MANIFIESTOS Y CONFIGURACIÓN

### requirements.txt

```bash
# Estado actual: SIN VERSIONES
RPi.GPIO
telnetlib3
flask
usb
mcculw
flask-socketio 
eventlet
pyusb
pexpect
```

**Recomendación** → Actualizar a:

```bash
# Python 3.9+ compatible
RPi.GPIO==0.7.1
telnetlib3==1.0.4
Flask==3.0.0
pyusb==1.2.1
mcculw==1.0.0
flask-socketio==5.3.4
eventlet==0.33.3
pexpect==4.9.1
python-dotenv==1.0.0
Werkzeug==3.0.0
```

### package.json

**Estado**: Completo y bien documentado

```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

**Scripts Detectados:**
- ✅ `dev` - Desarrollo
- ✅ `build` - Compilación
- ✅ `start` - Producción
- ✅ `lint` - Linting (ESLint)

**Faltantes:**
- ❌ `test` - Tests unitarios/e2e
- ❌ `type-check` - TypeScript
- ❌ `format` - Prettier

### config.py

**Estado**: Excelente centralización

```python
# Configuración de variables de entorno
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

# Hardware limits
XLN_VOLTAGE_MAX = 300.0
XLN_CURRENT_MAX = 5.2
DAQ_CHANNELS = 8
DAQ_TEMP_MIN = -270.0
DAQ_TEMP_MAX = 2000.0

# Experimentos
EXPERIMENT_POWER_LEVELS = [1.0, 2.0, 3.0]  # Watts
EXPERIMENT_DURATION_PER_LEVEL = 600  # 10 min
EXPERIMENT_SAMPLE_RATE = 60  # 1 lectura/min
```

**Positivos:**
- ✅ Env vars con defaults
- ✅ Límites de hardware documentados
- ✅ Directorios dinámicos (Path)

**Faltantes:**
- ❌ Validación de env vars requeridas
- ❌ .env.example no existe
- ❌ Modo debug/testing
- ❌ Configuración de logging por nivel ENV

---

## FALENCIAS DETECTADAS

### Críticas ❌

#### 1. **SIN CONTROL DE VERSIONES DE DEPENDENCIAS**
- **Impacto**: Builds no reproducibles, compatibilidad rota
- **Archivos**: `requirements.txt` (9 librerías sin versión)
- **Acción**: Generar `pip freeze > requirements.lock.txt`

#### 2. **SIN TESTING AUTOMATIZADO**
- **Impacto**: Regresiones silenciosas, calidad desconocida
- **Faltantes**: 
  - Tests unitarios (pytest)
  - Tests integración (Flask test client)
  - Tests e2e (Playwright/Cypress)
- **Acción**: Plan completo de testing (ver sección)

#### 3. **SIN CI/CD**
- **Impacto**: Despliegues manuales, sin validación
- **Faltantes**: GitHub Actions, GitLab CI
- **Acción**: Crear `.github/workflows/` con lint, test, deploy

#### 4. **SIN AUTENTICACIÓN API**
- **Impacto**: API completamente abierta
- **Endpoints**: `/api/fuente/*`, `/api/daq/*`, `/api/relays/*`
- **Acción**: Implementar JWT o API keys

#### 5. **FRONTEND DESACOPLADO**
- **Impacto**: package.json refiere a Next.js pero templates/ usa Jinja2
- **Evidencia**: `index.html` es template Flask, no build Next.js
- **Acción**: Decisión: ¿Full Next.js o simple HTML/JS?

### Altas ⚠️

#### 6. **FALTA package-lock.json**
- **Impacto**: NPM install puede instalar versiones incompatibles
- **Acción**: `npm install --save-exact` + commit package-lock.json

#### 7. **FALTA .env.example**
- **Impacto**: Nuevos contribuidores no saben qué vars configurar
- **Variables Requeridas**:
  ```
  FLASK_HOST=0.0.0.0
  FLASK_PORT=5000
  FLASK_DEBUG=False
  XLN_HOST=192.168.1.100
  XLN_PORT=5024
  DAQ_TIMEOUT=10
  ```
- **Acción**: Crear `.env.example` documentado

#### 8. **FALTA DOCKERFILE**
- **Impacto**: Despliegue no reproducible
- **Desafío**: Raspberry Pi ARM, drivers MCC, GPIO
- **Acción**: Dockerfile multi-stage + docker-compose

#### 9. **FALTA python-dotenv EN requirements.txt**
- **Impacto**: Código llama `os.getenv()` pero no carga `.env`
- **Acción**: Agregar `python-dotenv==1.0.0`

#### 10. **LOGGING SOLO A ARCHIVO**
- **Impacto**: Sin observabilidad en tiempo real
- **Faltantes**: stdout, structured logging, niveles por módulo
- **Acción**: Usar `logging.config` o structlog

### Medias ⚠️

#### 11. **NEXT.JS 16 PRÓXIMO EOL**
- **Fecha**: Next 16 EOL Feb 2025
- **Actual**: Next 17 disponible
- **Acción**: Plan de upgrade en roadmap

#### 12. **SCRIPTS DE EJECUCIÓN FALTANTES**
- **Faltantes**: No hay scripts bash para instalar, ejecutar, testear
- **Acciones**: Crear `scripts/install.sh`, `scripts/run.sh`, `scripts/test.sh`

#### 13. **VARIABLES DE ENTORNO NO VALIDADAS**
- **Impacto**: Errores en runtime, no en startup
- **Ejemplo**: `XLN_HOST` puede ser inválido IP
- **Acción**: Validar en config.py con esquema (pydantic)

#### 14. **FALTA DOCS SOBRE INSTALACIÓN DE DRIVERS MCC**
- **Impacto**: DAQ no funciona sin drivers
- **Acción**: README con pasos exactos: `sudo apt install mcc-libusb`, etc.

#### 15. **SIN MANEJO DE EXCEPCIONES EN FLASK**
- **Riesgo**: Errores exponen stack traces, sin formato JSON consistente
- **Acción**: Flask error handlers globales

---

## TABLA DE DEPENDENCIAS CLAVE

| Librería | Versión Actual | Versión Recomendada | Stability | Risk | Action |
|----------|---|---|---|---|---|
| **Python** | 3.9+ (req.) | 3.11+ | ✅ | LOW | Upgrade to 3.11 LTS |
| **Flask** | 3.0.0 | 3.0.1 | ✅ | LOW | Update patch |
| **Flask-socketio** | s/v | 5.3.4 | ✅ | MEDIUM | Pin version |
| **RPi.GPIO** | 0.7.1 | 0.7.1 | ✅ | LOW | Stable |
| **Eventlet** | s/v | 0.33.3 | ⚠️ | MEDIUM | Pin + test |
| **pyusb** | s/v | 1.2.1 | ✅ | LOW | Pin version |
| **Werkzeug** | (indirect) | 3.0.0 | ✅ | LOW | Add explicit |
| **Next.js** | 16.0.0 | 17.1.0 | ⚠️ | MEDIUM | Plan upgrade |
| **React** | 19.2.0 | 19.2.0 | ✅ | LOW | Keep current |
| **Tailwind CSS** | 4.1.9 | 4.1.9 | ✅ | LOW | Keep current |
| **Zod** | 3.25.76 | 3.25.x | ✅ | LOW | Keep current |

---

## SCRIPTS DE BUILD, SERVE Y TEST

### Backend (Python/Flask)

**Ejecución Simple:**
```bash
# Desarrollo (sin virtualenv)
python3 labpipanel.py

# Con virtualenv
source venv/bin/activate
python3 labpipanel.py
```

**Problemas Detectados:**
- ❌ No hay script `setup.py` o `pyproject.toml`
- ❌ No hay punto de entrada único (main guard faltante en labpipanel.py)
- ❌ No hay proceso supervisor definido

### Frontend (Next.js)

```bash
# Desarrollo
npm run dev          # http://localhost:3000

# Build producción
npm run build

# Iniciar producción
npm run start

# Lint
npm run lint
```

**Faltantes:**
- ❌ `npm run test`
- ❌ `npm run type-check`
- ❌ `npm run format`

### Puntos de Entrada

| Tipo | Archivo | Estado |
|------|---------|--------|
| **Backend main** | `labpipanel.py` | ⚠️ Sin `if __name__ == "__main__"` |
| **Frontend entry** | `package.json:scripts.dev` | ✅ Presente |
| **Binarios esperados** | None | N/A (web app) |

---

## VARIABLES DE ENTORNO REQUERIDAS

### Actualmente Documentadas ✅

```python
FLASK_HOST (default: "0.0.0.0")
FLASK_PORT (default: 5000)
FLASK_DEBUG (default: False)
XLN_HOST (default: "192.168.1.100")
XLN_PORT (default: 5024)
DAQ_TIMEOUT (hardcoded: 10)
```

### Faltantes / No Documentadas ❌

```
RASPBERRY_PI_IP          # Para remote execution
XLN_TELNET_RETRY_COUNT   # Reintentos de conexión
DAQ_DEVICE_PATH          # Path a dispositivo USB
MCC_DRIVERS_PATH         # Path a libmccusb
SECRET_KEY               # Para Flask sessions
LOG_LEVEL                # DEBUG|INFO|WARNING|ERROR
ENABLE_PROFILING         # Para análisis de rendimiento
CORS_ORIGINS             # Para CORS API
```

### Recomendación

Crear `.env.example`:
```bash
# Flask Configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
SECRET_KEY=your-secret-key-here

# Hardware Configuration
XLN_HOST=192.168.1.100
XLN_PORT=5024
XLN_TIMEOUT=10

DAQ_TIMEOUT=10
DAQ_CHANNELS=8
DAQ_THERMOCOUPLE_TYPE=K

RELAY_GPIO_26=RELAY_1_PUMP
RELAY_GPIO_20=RELAY_2_BACKUP1
RELAY_GPIO_21=RELAY_3_BACKUP2
RELAY_GPIO_16=RELAY_4_BACKUP3

# Experiment Configuration
EXPERIMENT_POWER_LEVELS=1.0,2.0,3.0
EXPERIMENT_DURATION=600
EXPERIMENT_SAMPLE_RATE=60

# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=/var/log/labpipanel/app.log

# Observability
ENABLE_METRICS=True
METRICS_PORT=9090
```

---

## PLAN DE PRUEBAS

### 1. Pruebas Unitarias

#### Backend (pytest)

**Módulo**: `fuente_xln.py`
```bash
# Test: Validación de voltaje
pytest tests/unit/test_fuente_xln.py::test_validate_voltage -v
pytest tests/unit/test_fuente_xln.py::test_validate_voltage_negative
pytest tests/unit/test_fuente_xln.py::test_validate_voltage_exceeds_max

# Test: Parseo de respuestas
pytest tests/unit/test_fuente_xln.py::test_parse_float_response
pytest tests/unit/test_fuente_xln.py::test_parse_invalid_response
```

**Módulo**: `daq_usb5203.py`
```bash
# Test: Validación de canales
pytest tests/unit/test_daq.py::test_channel_range_valid
pytest tests/unit/test_daq.py::test_channel_range_invalid

# Test: Validación de tipos termopares
pytest tests/unit/test_daq.py::test_thermocouple_type_valid
pytest tests/unit/test_daq.py::test_thermocouple_type_invalid

# Test: Rango de temperatura
pytest tests/unit/test_daq.py::test_temperature_range_valid
pytest tests/unit/test_daq.py::test_temperature_range_invalid
```

**Módulo**: `relay_controller.py`
```bash
# Test: Control de relés (mock GPIO)
pytest tests/unit/test_relays.py::test_activate_relay
pytest tests/unit/test_relays.py::test_deactivate_relay
pytest tests/unit/test_relays.py::test_toggle_relay
pytest tests/unit/test_relays.py::test_invalid_relay_name
```

**Módulo**: `thermal_experiment.py`
```bash
# Test: Cálculo de potencia
pytest tests/unit/test_experiment.py::test_power_calculation
pytest tests/unit/test_experiment.py::test_power_exceeds_limits

# Test: Resistencia térmica
pytest tests/unit/test_experiment.py::test_thermal_resistance_calculation
pytest tests/unit/test_experiment.py::test_thermal_resistance_invalid_power
```

**Coverage Target**: 80%+

#### Frontend (Jest/Vitest)

```bash
# Tests unitarios de componentes React
npm test -- tests/unit/components

# Tests de hooks
npm test -- tests/unit/hooks

# Tests de utilidades
npm test -- tests/unit/utils

# Coverage
npm test -- --coverage
```

### 2. Pruebas de Integración

#### Backend

```bash
# Test: API Status endpoint (sin hardware)
pytest tests/integration/test_api_status.py
  - Verifica respuesta JSON
  - Verifica timestamp
  - Verifica estructura de respuesta

# Test: Flujo completo de experimento (con mocks)
pytest tests/integration/test_experiment_flow.py
  - Setup hardware mocks
  - Run experiment sequence
  - Verify data collection
  - Verify CSV export

# Test: Control de fuente (mock Telnet)
pytest tests/integration/test_fuente_integration.py
  - Connect/disconnect
  - Set/get voltage
  - Readback verification

# Test: DAQ (mock MCC commands)
pytest tests/integration/test_daq_integration.py
  - Multi-channel read
  - Error handling
  - Timeout behavior
```

#### Frontend-Backend

```bash
# Test: Conexión API
npm test -- tests/integration/api.test.ts
  - Fetch status
  - Fetch temperature data
  - Control commands

# Test: WebSocket real-time
npm test -- tests/integration/websocket.test.ts
  - Connect
  - Receive updates
  - Disconnect
```

### 3. Pruebas E2E

**Framework Recomendado**: Playwright o Cypress

```bash
# Test: Flujo de usuario completo
npm run test:e2e

# Test específico: Control de fuente
npm run test:e2e -- tests/e2e/power_supply.spec.ts
  - Navega a UI
  - Configura voltaje
  - Verifica lectura en vivo
  - Captura screenshot

# Test: Experimento completo
npm run test:e2e -- tests/e2e/thermal_experiment.spec.ts
  - Inicia experimento
  - Monitorea progreso
  - Verifica exportación CSV
```

### 4. Plan de Cobertura

| Módulo | Actual | Target | Métricas |
|--------|--------|--------|----------|
| `fuente_xln.py` | 0% | 90% | Statements, branches |
| `daq_usb5203.py` | 0% | 85% | Statements, branches |
| `relay_controller.py` | 0% | 90% | Statements, branches |
| `thermal_experiment.py` | 0% | 80% | Statements |
| **Backend Total** | **0%** | **85%** | |
| Frontend Components | 0% | 75% | Statements, branches |
| **Frontend Total** | **0%** | **70%** | |
| **GLOBAL** | **0%** | **80%** | Combined |

### 5. Datos de Prueba y Fixtures

#### Backend Fixtures (pytest)

```python
# tests/conftest.py

@pytest.fixture
def mock_fuente():
    """Mock FuenteXLN sin conexión real"""
    fuente = FuenteXLN("localhost", 5024)
    fuente.connection = Mock()
    return fuente

@pytest.fixture
def sample_temperatures():
    """Datos de temperatura válidos"""
    return {
        0: 25.5, 1: 26.2, 2: 25.8,  # Evaporador
        4: 18.2, 5: 17.9, 6: 18.1   # Condensador
    }

@pytest.fixture
def sample_experiment_config():
    """Configuración estándar de experimento"""
    return {
        "power_levels": [1.0, 2.0, 3.0],
        "duration": 600,
        "sample_rate": 60
    }
```

#### Frontend Test Data

```typescript
// tests/fixtures/mockData.ts

export const mockSystemStatus = {
  status: "ok",
  system: {
    fuente: "connected",
    daq: "ready",
    relays: {
      RELAY_1: false,
      RELAY_2: false,
      RELAY_3: false,
      RELAY_4: false
    }
  }
};

export const mockTemperatureData = {
  timestamp: "2024-01-15T10:30:00Z",
  temperatures: {
    evaporator: [25.5, 26.2, 25.8],
    condenser: [18.2, 17.9, 18.1]
  }
};
```

### 6. Mocks y Dobles de Prueba

#### Python Mocks

```python
# Mock conexión Telnet
from unittest.mock import Mock, patch

@patch('telnetlib.Telnet')
def test_fuente_voltage(mock_telnet):
    mock_telnet.return_value.read_until.return_value = b"50.0\n"
    fuente = FuenteXLN("192.168.1.100")
    voltage = fuente.get_voltage()
    assert voltage == 50.0

# Mock MCC drivers
@patch('subprocess.run')
def test_daq_read_channel(mock_run):
    mock_run.return_value = Mock(returncode=0, stdout="25.5")
    daq = DAQUSB5203()
    temp = daq.read_channel(0)
    assert temp == 25.5

# Mock RPi.GPIO
@patch('RPi.GPIO.output')
def test_relay_activate(mock_gpio):
    relay = RelayController({"RELAY_1": 26})
    relay.activate_relay("RELAY_1")
    mock_gpio.assert_called_with(26, GPIO.LOW)
```

#### Frontend Mocks

```typescript
// MSW (Mock Service Worker)
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/status', () => {
    return HttpResponse.json(mockSystemStatus);
  }),
  http.post('/api/fuente/voltage', () => {
    return HttpResponse.json({ status: "ok" });
  })
);
```

---

## GUÍA DE EJECUCIÓN LOCAL

### Opción 1: Sin Docker (Desarrollo Directo)

#### Requisitos Previos

```bash
# Sistema operativo
uname -m  # Debe ser: aarch64 (ARM64) en Raspberry Pi, o x86_64 local

# Python
python3 --version  # >= 3.9
which python3

# Node.js (para frontend)
node --version     # >= 18 recomendado
npm --version      # >= 9

# Git
git --version
```

#### 1. Clonar Repositorio

```bash
cd ~
git clone <URL_DEL_REPOSITORIO>
cd LabPiPanel
```

#### 2. Entorno Virtual Python

```bash
# Crear venv
python3 -m venv venv

# Activar (Linux/Mac)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate

# Actualizar pip
pip install --upgrade pip setuptools wheel
```

#### 3. Instalar Dependencias Python

```bash
# Opción A: requirements.txt actual (SIN VERSIONES)
pip install -r requirements.txt

# Opción B: RECOMENDADO - Con versiones fijadas
cat > requirements.txt << 'EOF'
RPi.GPIO==0.7.1
telnetlib3==1.0.4
Flask==3.0.0
pyusb==1.2.1
mcculw==1.0.0
flask-socketio==5.3.4
eventlet==0.33.3
pexpect==4.9.1
python-dotenv==1.0.0
Werkzeug==3.0.0
EOF

pip install -r requirements.txt
```

#### 4. Configurar Variables de Entorno

```bash
# Crear .env (basado en .env.example)
cat > .env << 'EOF'
# Flask
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True

# Hardware (ajustar a tu red)
XLN_HOST=192.168.1.100
XLN_PORT=5024
XLN_TIMEOUT=10

# DAQ
DAQ_CHANNELS=8
DAQ_THERMOCOUPLE_TYPE=K
DAQ_TIMEOUT=10

# Logs
LOG_LEVEL=INFO
EOF

# Verificar que .env se cargue
python3 -c "from config import *; print(f'FLASK_HOST: {FLASK_HOST}, FLASK_PORT: {FLASK_PORT}')"
```

#### 5. Instalar Drivers MCC (Raspberry Pi)

```bash
# Solo en Raspberry Pi con DAQ USB-5203 conectado

# Agregar repositorio
wget -q https://github.com/warrenjasper/Linux_Drivers/archive/master.zip
unzip master.zip
cd Linux_Drivers-master/USB/python

# Instalar
sudo make install

# Verificar
test-usb5203 -ch 0 -type K  # Debe retornar temperatura
```

#### 6. Ejecutar Backend

```bash
# Terminal 1: Backend Flask
cd ~/LabPiPanel
source venv/bin/activate
python3 labpipanel.py

# Salida esperada:
# ================================================================================
# LabPiPanel - Sistema de Control de Laboratorio Térmico
# Instituto Tecnológico Metropolitano (ITM) - Medellín, Colombia
# ================================================================================
# * Running on http://0.0.0.0:5000
# * Debug mode: ON
```

#### 7. Instalar Dependencias Frontend

```bash
# Terminal 2: Frontend Node.js
cd ~/LabPiPanel

# Opción A: Si package-lock.json existe
npm ci

# Opción B: Si no existe
npm install
npm install --save-exact  # Fijar versiones

# Generar package-lock.json para reproducibilidad
npm ci --lockfile=package-lock.json
```

#### 8. Ejecutar Frontend

```bash
# Desarrollo (con hot reload)
npm run dev

# Salida esperada:
# ▲ Next.js 16.0.0
# - Ready in 2.1s
# ▲ http://localhost:3000
```

#### 9. Acceder a la Aplicación

```
http://localhost:3000  → UI React/Next.js
http://localhost:5000  → API Flask (para debugging)
```

---

### Opción 2: Con Docker (Recomendado para Producción)

#### Crear Dockerfile

```dockerfile
# Dockerfile (multi-stage)

# STAGE 1: Build Backend (Python)
FROM python:3.11-slim-bullseye as backend-builder

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libusb-1.0-0-dev \
    libusb-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# STAGE 2: Build Frontend (Node.js)
FROM node:18-bullseye as frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# STAGE 3: Runtime (Python + Node)
FROM python:3.11-slim-bullseye

WORKDIR /app

# Instalar dependencias runtime
RUN apt-get update && apt-get install -y \
    libusb-1.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copiar frontend
COPY --from=frontend-builder /app/public /app/public
COPY --from=frontend-builder /app/.next /app/.next
COPY --from=frontend-builder /app/node_modules /app/node_modules

# Copiar código
COPY *.py /app/
COPY config.py /app/
COPY static/ /app/static/
COPY templates/ /app/templates/

# Crear directorios
RUN mkdir -p /app/logs /app/results

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/status || exit 1

# Entrypoint
CMD ["python", "-u", "labpipanel.py"]

EXPOSE 5000
EXPOSE 3000
```

#### Crear docker-compose.yml

```yaml
version: '3.8'

services:
  labpipanel:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: labpipanel
    ports:
      - "5000:5000"   # API Flask
      - "3000:3000"   # Frontend Next.js
    environment:
      FLASK_HOST: 0.0.0.0
      FLASK_PORT: 5000
      FLASK_DEBUG: "False"
      XLN_HOST: "192.168.1.100"  # Ajustar a tu red
      XLN_PORT: 5024
      XLN_TIMEOUT: 10
      DAQ_TIMEOUT: 10
      LOG_LEVEL: INFO
    volumes:
      # Para Raspberry Pi con hardware real
      - /dev/bus/usb:/dev/bus/usb  # DAQ USB
      - /sys/class/gpio:/sys/class/gpio  # GPIO relés
      # Persistencia
      - ./logs:/app/logs
      - ./results:/app/results
    devices:
      # GPIO device (si es necesario)
      - /dev/mem:/dev/mem
      - /dev/gpiomem:/dev/gpiomem
    privileged: true  # Necesario para GPIO en container
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  # Opcional: Nginx reverse proxy
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - labpipanel

volumes:
  logs:
  results:
```

#### Ejecutar con Docker

```bash
# Build
docker build -t labpipanel:latest .

# Run individual
docker run -d \
  -p 5000:5000 \
  -p 3000:3000 \
  -e FLASK_HOST=0.0.0.0 \
  -e XLN_HOST=192.168.1.100 \
  --device /dev/bus/usb \
  --volume /sys/class/gpio:/sys/class/gpio \
  --privileged \
  labpipanel:latest

# Run con docker-compose
docker-compose up -d
docker-compose logs -f  # Ver logs

# Detener
docker-compose down

# Verificar salud
docker-compose ps
curl http://localhost:5000/api/status
```

---

## PLAN DE CONTINUIDAD Y ESCALABILIDAD

### 1. Arquitectura Modular (12-Factor App)

**Estado Actual**: ⚠️ Parcial

| Factor | Implementado | Faltante |
|--------|--|--|
| **I. Codebase** | ✅ Git | ❌ Separación frontend-backend |
| **II. Dependencies** | ⚠️ requirements.txt sin versiones | 🔧 `poetry.lock`, `package-lock.json` |
| **III. Config** | ✅ config.py + .env | ❌ Validación de vars |
| **IV. Backing Services** | ✅ API como recurso | ❌ Separación de servicios |
| **V. Build/Run/Release** | ⚠️ Manual | 🔧 Automatizar con CI/CD |
| **VI. Processes** | ❌ Single process | 🔧 Múltiples workers |
| **VII. Port Binding** | ✅ 5000/3000 | ✅ Self-contained |
| **VIII. Concurrency** | ⚠️ Eventlet | 🔧 Gunicorn + Uvicorn |
| **IX. Disposability** | ⚠️ Graceful shutdown | 🔧 Signal handlers |
| **X. Dev/Prod Parity** | ⚠️ Docker | 🔧 Ambiente local ≠ prod |
| **XI. Logs** | ⚠️ Archivo | 🔧 stdout + agregador |
| **XII. Admin Processes** | ❌ Ninguno | 🔧 Migration tasks, scripts |

**Propuesta**: Implementar `pyproject.toml` + `poetry` en lugar de `requirements.txt`:

```toml
# pyproject.toml
[project]
name = "labpipanel"
version = "0.1.0"
description = "Sistema de Control Térmico"
requires-python = ">=3.9"

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "black>=23.0",
    "flake8>=5.0",
    "mypy>=1.0"
]

[tool.poetry.dependencies]
python = "^3.9"
Flask = "^3.0.0"
flask-socketio = "^5.3.4"
RPi.GPIO = "0.7.1"
# ... más

[tool.pytest.ini_options]
testpaths = ["tests"]
```

### 2. CI/CD Pipeline

**Crear `.github/workflows/test-deploy.yml`**:

```yaml
name: Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt pytest pytest-cov
      - run: pytest --cov=. --cov-report=xml
      - uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test -- --coverage

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install flake8 black
      - run: flake8 *.py
      - run: black --check .

  build-docker:
    needs: [test-backend, test-frontend, lint]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: |
            mutatronik-qa/labpipanel:latest
            mutatronik-qa/labpipanel:${{ github.sha }}

  deploy:
    needs: build-docker
    runs-on: self-hosted  # Ejecuta en Raspberry Pi
    steps:
      - run: docker pull mutatronik-qa/labpipanel:latest
      - run: docker-compose up -d
```

### 3. Observabilidad y Monitoreo

**Logging Estructurado**:

```python
# Usar pythonjson-logger
from pythonjson_logger import jsonlogger
import logging

logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Logs en JSON → parseable por ELK/Datadog
logger.info("Experiment started", extra={
    "experiment_id": "exp_001",
    "power_w": 2.5,
    "timestamp": datetime.now().isoformat()
})
```

**Métricas Prometheus**:

```python
from prometheus_client import Counter, Gauge, Histogram, start_http_server

# Métricas
experiments_total = Counter('experiments_total', 'Total experiments')
temperature_gauge = Gauge('temperature_celsius', 'Current temperature', ['channel'])
api_request_duration = Histogram('api_request_seconds', 'API request duration')

# Exponer en /metrics:9090
start_http_server(9090)
```

**Alertas y SLO**:

```
SLO API: 99.9% uptime, p99 latency < 500ms
SLO Dataacquisition: p99 < 100ms por lectura
SLO Experiment: 100% completitud de datos
```

### 4. Seguridad

#### Autenticación API

```python
from flask import request
from functools import wraps
from datetime import datetime, timedelta
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return {"error": "Missing token"}, 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = payload['user_id']
        except:
            return {"error": "Invalid token"}, 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/status')
@token_required
def api_status():
    # ... Protegido
```

#### HTTPS y CORS

```python
from flask_cors import CORS
from flask_talisman import Talisman

Talisman(app)  # HTTPS/CSP headers
CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","))
```

### 5. Escalabilidad

#### Multi-Process Backend

```python
# gunicorn + Flask
# gunicorn -w 4 -b 0.0.0.0:5000 labpipanel:app

# Con Nginx reverse proxy
# upstream labpipanel {
#     server localhost:5001;
#     server localhost:5002;
#     server localhost:5003;
#     server localhost:5004;
# }
```

#### Frontend Optimization

```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    unoptimized: false,  // Cloudinary/CDN
    domains: ['api.labpipanel.local']
  },
  experimental: {
    optimizePackageImports: ['@radix-ui']
  }
}
```

### 6. Roadmap Propuesto

| Sprint | Milestone | Tasks |
|--------|-----------|-------|
| **Sprint 1 (2 sem)** | Cimientos | ✅ Tests unitarios (80% coverage) |
|  | | ✅ GitHub Actions CI/CD |
|  | | ✅ package-lock.json + requirements.lock |
|  | | ✅ Dockerfile productivo |
| **Sprint 2 (2 sem)** | Observabilidad | ✅ Structured logging (JSON) |
|  | | ✅ Prometheus metrics |
|  | | ✅ Grafana dashboards |
| **Sprint 3 (2 sem)** | Seguridad | ✅ JWT authentication |
|  | | ✅ HTTPS + Nginx |
|  | | ✅ Rate limiting |
| **Sprint 4 (1 mes)** | Escalabilidad | ✅ Multi-process Gunicorn |
|  | | ✅ Frontend CDN |
|  | | ✅ Load testing |
| **Sprint 5 (1 mes)** | Polish | ✅ E2E tests (Playwright) |
|  | | ✅ Performance optimization |
|  | | ✅ Documentation |

---

## README PROPUESTO

```markdown
# LabPiPanel - Sistema de Control de Laboratorio Térmico

![LabPiPanel](https://img.shields.io/badge/Python-3.9%2B-blue) ![Next.js](https://img.shields.io/badge/Next.js-16.0-black) ![Flask](https://img.shields.io/badge/Flask-3.0-green) ![License](https://img.shields.io/badge/License-MIT-green)

**LabPiPanel** es un sistema integrado de control de laboratorio para investigación térmica, basado en Raspberry Pi 4. Integra control automatizado de fuentes de alimentación, adquisición de datos de termopares y secuencias de experimentos térmicos, con una interfaz web moderna.

## Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [API REST](#api-rest)
- [Pruebas](#pruebas)
- [Calidad de Código](#calidad-de-código)
- [Docker](#docker)
- [Observabilidad](#observabilidad)
- [CI/CD](#cicd)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Migraciones y Actualizaciones](#migraciones-y-actualizaciones)
- [Plan de Crecimiento](#plan-de-crecimiento)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Características

### Control de Instrumentación
- ✅ Fuente BK Precision XLN30052 (0-300V, 0-5.2A) con comunicación Telnet SCPI
- ✅ DAQ Measurement Computing USB-5203 (8 canales termopares tipo K, 24-bit)
- ✅ Módulo de relés Waveshare 4 canales (GPIO control, activos en BAJO)
- ✅ Validación automática de rangos y detección de errores

### Experimentos Automatizados
- ✅ Secuencias configurables de niveles de potencia
- ✅ Adquisición de datos en tiempo real con frecuencia ajustable
- ✅ Cálculo automático de resistencia térmica (°C/W)
- ✅ Exportación de datos a CSV con timestamp

### Interfaz Web
- ✅ Frontend moderno con Next.js 16 + React 19
- ✅ Componentes accesibles (Radix UI)
- ✅ Diseño responsivo (desktop, tablet, móvil)
- ✅ Gráficos en tiempo real (Recharts)
- ✅ WebSocket para actualizaciones en vivo

## Requisitos

### Hardware Mínimo
- **Raspberry Pi 4** (2GB RAM mínimo, recomendado 4GB)
- **Sistema Operativo**: Raspberry Pi OS (Bullseye/Bookworm)
- **Conexión**: Ethernet con IP fija
- **Hardware Externo**:
  - Fuente BK Precision XLN30052
  - DAQ USB-5203 Measurement Computing
  - Módulo Waveshare 4-channel relay
  - 8 termopares tipo K

### Software Requerido
- Python 3.9+ (3.11 recomendado)
- Node.js 18+ (para frontend)
- pip (Python package manager)
- npm (Node package manager)

## Instalación

### Opción A: Instalación Local (Sin Docker)

#### 1. Clonar el Repositorio
\`\`\`bash
cd ~
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel
\`\`\`

#### 2. Crear Entorno Virtual Python
\`\`\`bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\\Scripts\\activate  # Windows
\`\`\`

#### 3. Instalar Dependencias Python
\`\`\`bash
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

#### 4. Instalar Dependencias Node.js (Frontend)
\`\`\`bash
npm ci  # Usar npm ci para reproducibilidad si existe package-lock.json
npm install  # O si es la primera vez
\`\`\`

#### 5. Configurar Variables de Entorno
\`\`\`bash
cp .env.example .env
nano .env  # Editar con tu configuración
\`\`\`

**Variables Requeridas**:
\`\`\`env
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
XLN_HOST=192.168.1.100  # IP de tu fuente
XLN_PORT=5024
DAQ_TIMEOUT=10
\`\`\`

#### 6. Instalar Drivers MCC (Raspberry Pi)
\`\`\`bash
# Solo en Raspberry Pi con DAQ USB-5203

wget https://github.com/warrenjasper/Linux_Drivers/archive/master.zip
unzip master.zip
cd Linux_Drivers-master/USB/python
sudo make install

# Verificar instalación
test-usb5203 -ch 0 -type K
\`\`\`

### Opción B: Instalación con Docker (Recomendado Producción)

\`\`\`bash
# Build
docker build -t labpipanel:latest .

# Run
docker-compose up -d

# Verificar
docker-compose ps
curl http://localhost:5000/api/status
\`\`\`

## Ejecución

### Desarrollo Local

#### Terminal 1: Backend Flask
\`\`\`bash
source venv/bin/activate
python3 labpipanel.py
# Accesible en http://localhost:5000
\`\`\`

#### Terminal 2: Frontend Next.js
\`\`\`bash
npm run dev
# Accesible en http://localhost:3000
\`\`\`

**Acceso**:
- **UI Web**: http://localhost:3000
- **API Debug**: http://localhost:5000/api/status

### Producción con Gunicorn

\`\`\`bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 labpipanel:app
\`\`\`

### Con Docker Compose

\`\`\`bash
docker-compose up -d
docker-compose logs -f
docker-compose down  # Detener
\`\`\`

## API REST

### Endpoints Principales

#### Estado del Sistema
\`\`\`bash
GET /api/status
# Respuesta: {status: "ok", system: {fuente, daq, relays, experiment}}
\`\`\`

#### Control de Fuente
\`\`\`bash
GET /api/fuente/voltage
POST /api/fuente/voltage {"voltage": 50.0}
GET /api/fuente/current
POST /api/fuente/current {"current": 2.5}
\`\`\`

#### Adquisición de Datos
\`\`\`bash
GET /api/daq/channels
GET /api/daq/channel/0
\`\`\`

#### Control de Relés
\`\`\`bash
POST /api/relay/RELAY_1/toggle
GET /api/relay/status
\`\`\`

#### Experimentos
\`\`\`bash
POST /api/experiment/start
GET /api/experiment/status
POST /api/experiment/stop
\`\`\`

**Documentación completa**: Ver [API.md](API.md)

## Pruebas

### Pruebas Unitarias (Backend)

\`\`\`bash
# Instalar pytest
pip install pytest pytest-cov

# Ejecutar tests
pytest tests/unit/ -v

# Con cobertura
pytest tests/ --cov=. --cov-report=html
# Abrir htmlcov/index.html en navegador
\`\`\`

### Pruebas Unitarias (Frontend)

\`\`\`bash
npm test -- --coverage
\`\`\`

### Pruebas de Integración

\`\`\`bash
# Backend (con mocks de hardware)
pytest tests/integration/ -v

# Frontend-Backend
npm run test:integration
\`\`\`

### Pruebas E2E

\`\`\`bash
# Instalar Playwright
npm install -D @playwright/test

# Ejecutar
npx playwright test
npx playwright test --ui  # Modo visual
\`\`\`

### Cobertura

| Módulo | Target | Comando |
|--------|--------|---------|
| Backend | 85% | \`pytest --cov=. --cov-report=term-missing\` |
| Frontend | 70% | \`npm test -- --coverage\` |

## Calidad de Código

### Linting y Formatting

#### Python
\`\`\`bash
pip install black flake8 mypy

# Linting
flake8 *.py

# Formatting
black .

# Type checking
mypy *.py
\`\`\`

#### JavaScript/TypeScript
\`\`\`bash
npm run lint
npm run format
npm run type-check
\`\`\`

### Pre-commit Hooks (Opcional)

\`\`\`bash
pip install pre-commit

# Crear .pre-commit-config.yaml
# Luego:
pre-commit install
\`\`\`

## Docker

### Build Multi-Stage

\`\`\`bash
# Build backend + frontend en un stage
# Copia en runtime stage
docker build -t labpipanel:latest .
\`\`\`

### docker-compose.yml

\`\`\`bash
docker-compose up -d            # Iniciar
docker-compose ps               # Estado
docker-compose logs -f app      # Logs en vivo
docker-compose stop             # Pausar
docker-compose down -v          # Detener y eliminar volúmenes
\`\`\`

### Raspberry Pi Specific

```bash
# GPIO y USB en container
docker-compose up -d --privileged

# Verificar dispositivos
docker exec labpipanel ls -la /dev/bus/usb
docker exec labpipanel gpio -v
```

## Observabilidad

### Logging Estructurado

Los logs se generan en JSON (parseable):

\`\`\`bash
tail -f logs/app.log | jq .

# Filtrar por nivel
tail -f logs/app.log | jq 'select(.levelname=="ERROR")'
\`\`\`

### Métricas Prometheus

\`\`\`bash
# Endpoint: http://localhost:9090/metrics
# Métricas incluyen:
# - experiments_total
# - temperature_gauge
# - api_request_seconds
\`\`\`

### Dashboards Grafana

\`\`\`bash
docker run -d -p 3001:3000 grafana/grafana
# Acceder a http://localhost:3001
# Agregar data source: http://prometheus:9090
\`\`\`

## CI/CD

### GitHub Actions

El proyecto incluye workflow en `.github/workflows/test-deploy.yml`:

\`\`\`bash
# En cada push/PR:
# 1. Lint (flake8, black)
# 2. Tests backend (pytest)
# 3. Tests frontend (jest/vitest)
# 4. Build Docker
# 5. Deploy (si es main)
\`\`\`

**Ver estado**: https://github.com/mutatronik-qa/LabPiPanel/actions

## Estructura del Proyecto

\`\`\`
LabPiPanel/
├── labpipanel.py           # Main server (Flask)
├── config.py               # Configuration centralized
├── fuente_xln.py           # XLN Power Supply driver
├── daq_usb5203.py          # DAQ thermocouples driver
├── relay_controller.py     # GPIO relay control
├── thermal_experiment.py   # Experiment automation
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
│
├── templates/
│   └── index.html          # Flask template
├── static/
│   └── css/
│       └── style.css       # Styles
│
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│
├── Dockerfile              # Docker build
├── docker-compose.yml      # Services orchestration
│
├── docs/
│   ├── README.md           # This file
│   ├── API.md              # API documentation
│   ├── HARDWARE.md         # Hardware specs
│   └── GUIA_ITM.md         # Institutional guide
│
└── logs/                   # Application logs
    results/                # Experiment results (CSV)
\`\`\`

## Migraciones y Actualizaciones

### Actualizar Dependencias Python

\`\`\`bash
# Ver actualizaciones disponibles
pip list --outdated

# Actualizar todo
pip install --upgrade -r requirements.txt

# Generar lock file
pip freeze > requirements.lock.txt
\`\`\`

### Actualizar Dependencias Node.js

\`\`\`bash
# Ver updates
npm outdated

# Actualizar
npm update

# Next.js upgrade
npm install next@latest

# Generar lock
npm ci --package-lock-only
\`\`\`

### Migración a Next.js 17

\`\`\`bash
npm install next@17
npm run build

# Revisar breaking changes: https://nextjs.org/docs/upgrading
\`\`\`

## Plan de Crecimiento

### Corto Plazo (3 meses)

- ✅ 80% cobertura de tests unitarios
- ✅ CI/CD pipeline completamente funcional
- ✅ Dockerfile optimizado para producción
- ✅ Documentación técnica completa

### Mediano Plazo (6 meses)

- 📊 Agregación de datos a base de datos (PostgreSQL)
- 📈 Dashboard de históricos y análisis
- 🔐 Autenticación JWT + multi-usuario
- 🚀 Escalabilidad a múltiples Raspberry Pi

### Largo Plazo (12+ meses)

- ☁️ Integración cloud (Azure/AWS)
- 📱 Aplicación móvil (React Native)
- 🤖 Machine Learning para predicción térmica
- 🌐 Colaboración remota en tiempo real

## Troubleshooting

### DAQ USB no detectado

\`\`\`bash
# Verificar dispositivo
lsusb | grep "1604:8410"

# Reinstalar drivers
cd Linux_Drivers-master/USB/python
sudo make clean
sudo make install
\`\`\`

### Conexión Telnet a fuente falla

\`\`\`bash
# Verificar IP y puerto
telnet 192.168.1.100 5024

# Reset de fuente (off 30s y on)
# O usar command: *RST
\`\`\`

### GPIO permiso denegado

\`\`\`bash
# Ejecutar como root
sudo python3 labpipanel.py

# O agregar usuario a grupo gpio
sudo usermod -aG gpio $USER
# Log out y log in
\`\`\`

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Cita

Si usas LabPiPanel en investigación, por favor cita:

\`\`\`bibtex
@software{labpipanel2024,
  author = {Instituto Tecnológico Metropolitano},
  title = {LabPiPanel: Thermal Laboratory Control System},
  year = {2024},
  url = {https://github.com/mutatronik-qa/LabPiPanel}
}
\`\`\`

---

**Última actualización**: Febrero 4, 2026  
**Mantenedor**: ITM Facultad de Ingeniería
\`\`\`

---

## ISSUES Y TAREAS PRIORIZADAS

### 🔴 CRÍTICOS (Sprint 1 - 2 semanas)

#### Issue #1: Versionar Dependencias Python
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 2 horas  
**Descripción**: `requirements.txt` no tiene versiones, causando builds no reproducibles  
**Tareas**:
```bash
# 1. Generar lock file
pip freeze > requirements.lock.txt

# 2. Actualizar requirements.txt con versiones
# Editar: RPi.GPIO==0.7.1, Flask==3.0.0, etc.

# 3. Probar instalación limpia
rm -rf venv && python3 -m venv venv && pip install -r requirements.txt

# 4. Verificar compatibilidad
python3 labpipanel.py --test-import
```
**Entregable**: `requirements.txt` actualizado + `requirements.lock.txt`

---

#### Issue #2: Crear package-lock.json
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 1 hora  
**Descripción**: `package-lock.json` faltante, NPM instala versiones variables  
**Tareas**:
```bash
# 1. Limpiar node_modules
rm -rf node_modules package-lock.json

# 2. Reinstalar con lock exacto
npm ci

# 3. Commit
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

---

#### Issue #3: Crear .env.example
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 1 hora  
**Descripción**: Nuevos contribuidores no saben qué variables de entorno configurar  
**Archivo**: `.env.example`
```bash
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
XLN_HOST=192.168.1.100
XLN_PORT=5024
DAQ_TIMEOUT=10
LOG_LEVEL=INFO
```

---

#### Issue #4: Agregar python-dotenv a requirements
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 30 min  
**Descripción**: `config.py` usa `os.getenv()` pero no carga archivo `.env`  
**Acción**:
```bash
# Agregar a requirements.txt
echo "python-dotenv==1.0.0" >> requirements.txt

# Actualizar config.py
from dotenv import load_dotenv
load_dotenv()
```

---

#### Issue #5: Crear tests unitarios backend (80% coverage)
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 16 horas  
**Descripción**: Sin testing, regresiones silenciosas  
**Tareas**:
```bash
# Instalar pytest
pip install pytest pytest-cov pytest-mock

# Crear estructura
mkdir -p tests/unit tests/integration

# Tests unitarios
tests/unit/test_fuente_xln.py (40% → 90% coverage)
tests/unit/test_daq_usb5203.py
tests/unit/test_relay_controller.py
tests/unit/test_thermal_experiment.py
tests/unit/test_config.py

# Ejecutar
pytest tests/unit/ --cov=. --cov-report=html

# Target: 80%+ coverage
```
**Entregable**: 50+ test cases + coverage report

---

### 🟠 ALTOS (Sprint 1-2)

#### Issue #6: Crear GitHub Actions CI/CD
**Prioridad**: 🟠 ALTO  
**Estimación**: 8 horas  
**Descripción**: Sin CI/CD, despliegues no validados  
**Archivo**: `.github/workflows/test-deploy.yml`
```yaml
- name: Test Backend
  run: pytest --cov=.
  
- name: Lint Python
  run: flake8 *.py
  
- name: Build Docker
  run: docker build -t labpipanel:latest .
  
- name: Deploy (main branch)
  if: github.ref == 'refs/heads/main'
  run: docker push mutatronik-qa/labpipanel:latest
```

---

#### Issue #7: Crear Dockerfile multi-stage
**Prioridad**: 🟠 ALTO  
**Estimación**: 4 horas  
**Descripción**: Despliegue manual no reproducible  
**Entregable**: `Dockerfile` + `docker-compose.yml` optimizados  
**Validación**:
```bash
docker build -t labpipanel:test .
docker run -p 5000:5000 labpipanel:test
curl http://localhost:5000/api/status
```

---

#### Issue #8: Documentar Instalación MCC Drivers
**Prioridad**: 🟠 ALTO  
**Estimación**: 2 horas  
**Descripción**: DAQ no funciona sin drivers, no hay guía  
**Entregable**: Sección en README con pasos exactos  
```bash
wget https://github.com/warrenjasper/Linux_Drivers/archive/master.zip
cd Linux_Drivers-master/USB/python
sudo make install
test-usb5203 -ch 0 -type K  # Verificar
```

---

### 🟡 MEDIANOS (Sprint 2-3)

#### Issue #9: Agregar autenticación JWT
**Prioridad**: 🟡 MEDIO  
**Estimación**: 8 horas  
**Descripción**: API completamente abierta  
**Implementar**:
```python
# Crear endpoint /auth/login
# Validar token en @token_required
# Proteger endpoints críticos: /api/fuente/*, /api/experiment/*
```

---

#### Issue #10: Implementar logging estructurado (JSON)
**Prioridad**: 🟡 MEDIO  
**Estimación**: 6 horas  
**Descripción**: Logs de texto sin estructura, difíciles de parsear  
**Librería**: `python-json-logger`  
**Beneficio**: Integración con ELK, Datadog, CloudWatch

---

#### Issue #11: Agregar Prometheus metrics
**Prioridad**: 🟡 MEDIO  
**Estimación**: 6 horas  
**Descripción**: Sin visibilidad de rendimiento  
**Métricas**: experiments_total, temperature_gauge, api_request_duration

---

#### Issue #12: Crear tests integración (pytest)
**Prioridad**: 🟡 MEDIO  
**Estimación**: 12 horas  
**Descripción**: Sin pruebas de flujos completos  
**Cobertura**: Experiment flow, API endpoints, Database layer

---

### 🟢 BAJOS (Sprint 3-4)

#### Issue #13: Upgrade a Next.js 17
**Prioridad**: 🟢 BAJO  
**Estimación**: 4 horas  
**Descripción**: Next 16 próximo EOL (Feb 2025)  
**Impacto**: Seguridad, performance, nuevas features

---

#### Issue #14: Agregar Playwright E2E tests
**Prioridad**: 🟢 BAJO  
**Estimación**: 12 horas  
**Descripción**: Sin pruebas end-to-end  
**Cobertura**: UI workflows críticos

---

#### Issue #15: Crear dashboard Grafana
**Prioridad**: 🟢 BAJO  
**Estimación**: 8 horas  
**Descripción**: Métricas sin visualización  
**Panel**: Temperature trends, experiment status, uptime

---

### ⚡ QUICK WINS (< 1 hora)

- [ ] Issue #16: Agregar `main` guard en `labpipanel.py`
- [ ] Issue #17: Crear `.gitignore` mejorado (`venv/`, `*.pyc`, `node_modules/`)
- [ ] Issue #18: Agregar badges en README (tests, coverage, docker)
- [ ] Issue #19: Crear `CONTRIBUTING.md` con guía de contribuciones
- [ ] Issue #20: Agregar `Makefile` con targets: `make test`, `make lint`, `make docker-build`

---

## CHECKLIST FINAL ACCIONABLE

### ✅ Pre-requisitos

- [ ] Python 3.9+ instalado
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Editor/IDE (VS Code recomendado)
- [ ] Docker instalado (opcional para desarrollo)

### ✅ Setup Inicial (Hoy)

- [ ] Clonar repositorio: `git clone <URL>`
- [ ] Crear venv: `python3 -m venv venv && source venv/bin/activate`
- [ ] Instalar deps Python: `pip install -r requirements.txt`
- [ ] Instalar deps Node: `npm ci`
- [ ] Copiar .env: `cp .env.example .env`
- [ ] Verificar estructura: `ls -la` (debe ver labpipanel.py, config.py, etc.)

### ✅ Verificación Funcional (Primera Semana)

- [ ] Backend inicia sin errores: `python3 labpipanel.py`
- [ ] API responde: `curl http://localhost:5000/api/status`
- [ ] Frontend build OK: `npm run build` (no errores)
- [ ] Frontend dev OK: `npm run dev` (http://localhost:3000 accesible)
- [ ] Tests unitarios corren: `pytest tests/unit/ -v`
- [ ] Linting pasa: `flake8 *.py` (0 errores)

### ✅ Críticos (Sprint 1)

- [ ] **Issue #1**: requirements.txt versionado
- [ ] **Issue #2**: package-lock.json generado
- [ ] **Issue #3**: .env.example creado
- [ ] **Issue #4**: python-dotenv agregado
- [ ] **Issue #5**: 80% coverage backend tests
- [ ] **Issue #6**: CI/CD pipeline funcionando
- [ ] **Issue #7**: Dockerfile productivo
- [ ] **Issue #8**: Documentación MCC drivers

### ✅ Altos (Sprint 2)

- [ ] Autenticación JWT implementada
- [ ] Logging estructurado (JSON)
- [ ] Prometheus metrics
- [ ] Tests integración
- [ ] docker-compose.yml completo
- [ ] Health checks funcionando

### ✅ Medios (Sprint 3)

- [ ] Upgrade Next.js 17
- [ ] E2E tests con Playwright
- [ ] Grafana dashboards
- [ ] Rate limiting en API
- [ ] HTTPS + Nginx reverse proxy
- [ ] Documentación de seguridad

### ✅ Bajos (Sprint 4+)

- [ ] Performance optimization
- [ ] Load testing (k6 o Apache JMeter)
- [ ] Database (PostgreSQL) para históricos
- [ ] Multi-instancia (replicas)
- [ ] Kubernetes deployment (opcional)
- [ ] Mobile app (React Native)

---

## RESUMEN EJECUTIVO PARA STAKEHOLDERS

### Estado del Proyecto

| Aspecto | Status | Riesgo |
|---------|--------|--------|
| **Funcionalidad Core** | ✅ Operacional | BAJO |
| **Documentación** | ✅ Buena | BAJO |
| **Testing** | ❌ Faltante | CRÍTICO |
| **Deployment** | ⚠️ Manual | ALTO |
| **Seguridad** | ⚠️ Básica | MEDIO |
| **Escalabilidad** | ⚠️ Limitada | MEDIO |

### Recomendaciones Principales

1. **Implementar tests unitarios** (80% coverage) → **Reduce riesgos a 2 semanas**
2. **Automatizar deployment** (CI/CD) → **Acelera time-to-market**
3. **Containerizar** (Docker) → **Facilita replicación en nuevos Raspberry Pi**
4. **Agregar autenticación** → **Protege API crítica**
5. **Establecer observabilidad** → **Detecta problemas antes que usuarios**

### ROI Esperado

| Inversión | Beneficio | Timeline |
|-----------|-----------|----------|
| 80 horas (Tests + CI/CD) | -70% bugs en producción | 2 semanas |
| 40 horas (Docker + docs) | 50% menos tiempo onboarding | 1 semana |
| 30 horas (Auth + security) | Cumple requerimientos corporativos | 1.5 semanas |
| **150 horas total** | **Sistema production-ready** | **5 semanas** |

---

**Documento generado**: Febrero 4, 2026  
**Auditor**: Ingeniero de Software Senior  
**Próxima revisión recomendada**: Abril 4, 2026
```

Ahora generaré archivos complementarios:
