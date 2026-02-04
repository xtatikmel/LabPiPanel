# 🏥 Laboratorio Térmico ITM - LabPiPanel

## 📋 Descripción General

Sistema de monitoreo y control de temperatura en tiempo real para el Laboratorio Térmico del Instituto Tecnológico Metropolitano (ITM). 

**Arquitectura modular profesional con:**
- Frontend moderno en React + Vite + TypeScript
- Backend robusto con Flask + Python
- Adquisición de datos en tiempo real (10Hz)
- Interfaz gráfica profesional con Shadcn/ui

---

## 📁 Estructura del Proyecto

```
LabPiPanel/
├── apps/
│   ├── frontend/              # React + Vite application
│   │   ├── src/
│   │   │   ├── components/    # Componentes reutilizables
│   │   │   ├── hooks/         # Custom hooks (useLiveData, etc)
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   ├── utils/         # Funciones utilitarias
│   │   │   ├── App.tsx        # Componente principal
│   │   │   └── main.tsx       # Entry point
│   │   ├── public/            # Assets estáticos
│   │   ├── package.json       # npm dependencies
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tsconfig.json      # TypeScript configuration
│   │   └── index.html         # HTML template
│   │
│   └── backend/               # Flask Python application
│       ├── app.py             # Servidor Flask principal
│       ├── requirements.txt   # pip dependencies
│       ├── alerts/            # Sistema de alertas
│       ├── hardware/          # Drivers de hardware
│       │   ├── fuente_xln.py  # Control Fuente XLN
│       │   ├── daq_reader.py  # DAQ USB-5203
│       │   └── gpio_controller.py  # Relés GPIO
│       ├── models/            # Modelos de datos
│       │   └── data_models.py # LiveData, AlertData, etc
│       └── recording/         # Grabación de datos
│
├── packages/                  # Código compartido (futuro)
│   └── types/                 # Tipos compartidos
│
├── docs/
│   ├── guias/                 # Guías de documentación
│   └── README.md              # Documentación principal
│
├── scripts/
│   ├── start-dev.ps1          # Script inicio (Windows)
│   ├── start-dev.sh           # Script inicio (Linux/Mac)
│   └── build-all.sh           # Build de producción
│
├── Makefile                   # Automatización de tareas
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Docker image definition
├── package.json               # Root workspace (monorepo)
├── tsconfig.base.json         # TypeScript base config
└── README.md                  # Este archivo
```

---

## 🚀 Quick Start

### Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Python** >= 3.9
- **pip** >= 21.x

### Instalación

```bash
# 1. Instalar todas las dependencias
make install

# O manualmente:
cd apps/frontend && npm install
cd ../backend && pip install -r requirements.txt
```

### Desarrollo Local

```bash
# Iniciar ambos servicios automáticamente
make dev

# O iniciar individualmente:
make backend   # Terminal 1: Flask en puerto 5000
make frontend  # Terminal 2: Vite en puerto 5173

# O con scripts:
./scripts/start-dev.ps1  # Windows
./scripts/start-dev.sh   # Linux/Mac
```

**Acceso:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Status: http://localhost:5000/api/status

---

## 📚 Estructura de Datos

### LiveData (tiempo real)

```typescript
interface LiveData {
  timestamp: number;
  voltage: number;           // V (Fuente XLN)
  current: number;           // A (Fuente XLN)
  power: number;             // W (calculado)
  temperatures: number[];    // °C (8 termocuplas DAQ)
  t_evap_avg: number;        // Promedio evaporador
  t_cond_avg: number;        // Promedio condensador
  r_thermal: number;         // Resistencia térmica calculada
  relay_state: boolean[];    // Estados de relés (4 GPIO)
  system_status: string;     // "running" | "error" | "idle"
}
```

### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/status` | Estado actual del sistema |
| GET | `/api/live-data` | SSE stream de datos en tiempo real |
| POST | `/api/fuente/voltage` | Establecer voltaje |
| POST | `/api/fuente/current` | Establecer corriente |
| POST | `/api/relay/{id}` | Controlar relé |
| GET | `/api/recordings` | Listar grabaciones |
| POST | `/api/recording/start` | Iniciar grabación |
| POST | `/api/recording/stop` | Detener grabación |

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
make dev         # Iniciar ambos servicios
make frontend    # Solo frontend
make backend     # Solo backend
make install     # Instalar dependencias

# Producción
make build       # Build del frontend
make clean       # Limpiar artifacts

# Control
make stop        # Detener servicios
make test        # Ejecutar tests
make info        # Información del proyecto
```

---

## 🐳 Docker (Producción)

```bash
# Build y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## 📖 Documentación

- [Guía Rápida](docs/guias/README.md) - Comienza aquí
- [Arquitectura Detallada](docs/guias/ARQUITECTURA_DETALLADA.md) - Diseño del sistema
- [Testeo Local](docs/guias/TESTEO_LOCAL_PASO_A_PASO.md) - Guía de pruebas
- [API Reference](docs/guias/) - Documentación de endpoints

---

## 🤝 Contribución

1. Crea una rama: `git checkout -b feature/nombre-feature`
2. Haz commit: `git commit -am "Agregar feature"`
3. Push: `git push origin feature/nombre-feature`
4. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es propiedad del Instituto Tecnológico Metropolitano (ITM).

---

## ✉️ Contacto

- **Instituto**: Instituto Tecnológico Metropolitano (ITM)
- **Ubicación**: Medellín, Colombia
- **Laboratorio**: Laboratorio Térmico

---

**Última actualización**: Febrero 2026
