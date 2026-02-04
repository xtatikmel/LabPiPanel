# REPORTE: INTEGRACIÓN Y DESPLIEGUE DEL FRONTEND KIMI EN RASPBERRY PI

**Proyecto:** LabPiPanel - Sistema de Control de Laboratorio Térmico  
**Instituto:** Instituto Tecnológico Metropolitano (ITM) - Medellín, Colombia  
**Fecha:** 4 de febrero de 2026  
**Versión:** 1.0

---

## EJECUTIVO

Este reporte detalla el proceso de integración del frontend generado por Kimi IA (solución mejorada con gráficos avanzados de sensores de temperatura y opciones de configuración superior) con la infraestructura backend existente de LabPiPanel, considerando el despliegue en Raspberry Pi 3/4.

**Conclusión Principal:** La integración es **VIABLE Y RECOMENDADA**. El frontend de Kimi presenta mejoras significativas en visualización de datos y gestión de configuración que justifican el trabajo de integración.

---

## 1. ANÁLISIS ACTUAL DEL PROYECTO

### 1.1 Arquitectura Existente

```
┌─────────────────────────────────────────────────────────┐
│                    LABPIPANEL ACTUAL                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React + Vite + TailwindCSS)                 │
│  └─ IA/project/src/                                    │
│     ├─ App.tsx (Estado global)                         │
│     ├─ components/ (7 componentes)                     │
│     ├─ types/index.ts (Interfaces TypeScript)          │
│     └─ utils/ (Simulador de datos, CSV exporter)       │
│                                                         │
│  Backend (Python Flask)                                │
│  └─ labpipanel.py (API REST)                           │
│     ├─ fuente_xln.py (Control Telnet)                  │
│     ├─ daq_usb5203.py (DAQ USB)                        │
│     ├─ relay_controller.py (GPIO relés)                │
│     └─ thermal_experiment.py (Experimentos)            │
│                                                         │
│  Infraestructura                                        │
│  └─ Docker + Docker Compose (ARM64 compatible)         │
│     └─ Soporte multi-stage build                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Características Clave del Backend

| Componente | Protocolo | Función |
|-----------|-----------|---------|
| **Fuente XLN30052** | Telnet (5024) | Control de V/I/P |
| **DAQ USB-5203** | USB/libusb | 8 termopares tipo K |
| **Relés** | GPIO BCM (4 canales) | Control de actuadores |
| **API Flask** | REST/JSON (puerto 5000) | Interfaz backend |

### 1.3 Stack Actual del Frontend

```json
{
  "build_tool": "Vite 5.4.2",
  "framework": "React 18.3.1",
  "styling": "TailwindCSS 3.4.1",
  "charting": "Canvas nativo (dibujado manual)",
  "ui_components": "lucide-react (iconos)",
  "data_flow": "Estado local (useState/useRef)"
}
```

**Limitaciones Identificadas:**
- Gráficos dibujados manualmente en Canvas (rendimiento limitado)
- No hay librería de gráficos especializados
- Configuración del sistema limitada a valores en código
- Estado de datos simulados (no conectado a API)

---

## 2. ANÁLISIS DEL FRONTEND KIMI IA

### 2.1 Mejoras Observadas

Basado en la revisión del resultado en https://33kpj7dv4ij64.ok.kimi.link:

✅ **Gráficos Avanzados:**
- Múltiples vistas de temperatura (8 canales individuales + promedios)
- Gráficos de V-I con mejor resolución
- Gráficos de potencia en tiempo real
- Cálculo dinámico de resistencia térmica

✅ **Interfaz de Configuración Mejorada:**
- Sección específica para configuración de fuente (IP/Puerto)
- Límites de operación editables (V máx, I máx, P máx)
- Almacenamiento de configuración

✅ **Sistema de Alertas Robusto:**
- Panel de alertas activas
- Historial de alertas
- Control de sonido
- Estados de hardware en tiempo real

✅ **Control de Relés Mejorado:**
- Etiquetas descriptivas (Compresor, Ventilador Cond, Ventilador Evap, Bomba)
- Vista de estado general
- Indicadores visuales claros

✅ **Panel de Grabación Avanzado:**
- Información sobre formato CSV
- Frecuencia de muestreo visible
- Campos grabados documentados

---

## 3. CONSIDERACIONES TÉCNICAS DE INTEGRACIÓN

### 3.1 Estructura de Directorios Propuesta

```
LabPiPanel/
├── IA/
│   └── project_kimi/                 [NUEVO - Frontend Kimi integrado]
│       ├── src/
│       │   ├── components/           [Componentes Kimi]
│       │   ├── utils/
│       │   │   ├── apiClient.ts      [Cliente HTTP para backend]
│       │   │   ├── dataFormatter.ts
│       │   │   ├── csvExporter.ts
│       │   │   └── validators.ts
│       │   ├── hooks/                [Hooks personalizados]
│       │   │   ├── useFuenteControl.ts
│       │   │   ├── useDAQData.ts
│       │   │   └── useExperiment.ts
│       │   ├── types/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       └── package.json
│       
├── backend/                          [REORGANIZACIÓN RECOMENDADA]
│   ├── labpipanel.py
│   ├── fuente_xln.py
│   ├── daq_usb5203.py
│   ├── relay_controller.py
│   ├── thermal_experiment.py
│   ├── config.py
│   ├── requirements.txt
│   └── api/                          [Nuevas rutas API]
│       ├── __init__.py
│       ├── routes.py
│       └── schemas.py
│       
├── docker-compose.yml                [ACTUALIZADO]
├── Dockerfile                         [ACTUALIZADO]
└── scripts/
    ├── deploy.sh
    ├── health-check.sh
    └── config-rpi.sh
```

### 3.2 Compatibilidad de Interfaces

**API Esperada por el Frontend Kimi:**

```typescript
// GET /api/status
{
  "system": {
    "fuente": { "connected": boolean, "voltage": number, "current": number, "power": number },
    "daq": { "status": string, "channels": number },
    "relays": { "relay_1": boolean, "relay_2": boolean, "relay_3": boolean, "relay_4": boolean }
  }
}

// GET /api/data/live
{
  "timestamp": ISO8601,
  "voltaje": number,
  "corriente": number,
  "potencia": number,
  "T_ch0..T_ch7": number[],
  "T_evap_avg": number,
  "T_cond_avg": number,
  "R_thermal": number
}

// POST /api/fuente/config
{
  "voltage_set": number,
  "current_set": number,
  "enabled": boolean
}

// POST /api/recording/start|stop
{
  "filename": string
}
```

**Estado Actual del Backend:**
- ✅ Rutas disponibles para V/I/P
- ✅ Estado de relés implementado
- ⚠️ Streaming de datos en tiempo real (requiere WebSocket o polling)
- ❌ No hay persistencia de configuración centralizada

### 3.3 Cambios Necesarios en el Backend

#### 3.3.1 API REST Improvements

**CRÍTICO - WebSocket para tiempo real:**

```python
# labpipanel.py - Agregar soporte WebSocket
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    logger.info("Cliente conectado")
    emit('response', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Cliente desconectado")

# Emitir datos en tiempo real cada 100ms
@socketio.on('request_live_data')
def send_live_data():
    while True:
        data = {
            'timestamp': datetime.now().isoformat(),
            'voltaje': fuente.get_voltage(),
            'corriente': fuente.get_current(),
            'potencia': fuente.get_power(),
            'T_ch0': daq.get_temperature(0),
            # ... resto de canales
        }
        emit('live_data', data)
        time.sleep(0.1)
```

**RECOMENDADO - Endpoint de configuración centralizada:**

```python
@app.route('/api/config', methods=['GET', 'POST'])
def api_config():
    """Gestionar configuración persistente del sistema"""
    if request.method == 'POST':
        config_data = request.get_json()
        # Guardar en archivo JSON o base de datos
        save_config(config_data)
        return jsonify({"status": "ok"}), 200
    else:
        return jsonify(load_config()), 200
```

**IMPORTANTE - CORS habilitado:**

```python
from flask_cors import CORS
CORS(app)  # Permitir solicitudes desde frontend
```

#### 3.3.2 Validación de Datos

```python
# Crear schemas.py para validación
class FuenteConfigSchema:
    def validate_voltage(self, v):
        if not (0 <= v <= 300):
            raise ValueError("Voltaje debe estar entre 0-300V")
        return v
    
    def validate_current(self, i):
        if not (0 <= i <= 5.2):
            raise ValueError("Corriente debe estar entre 0-5.2A")
        return i
```

### 3.4 Cambios Necesarios en el Frontend

#### 3.4.1 Cliente API HTTP

**Crear `src/utils/apiClient.ts`:**

```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    return res.json();
  },
  
  async setVoltage(voltage: number) {
    const res = await fetch(`${API_BASE}/fuente/voltage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voltage })
    });
    return res.json();
  },
  
  async startRecording() {
    const res = await fetch(`${API_BASE}/recording/start`, {
      method: 'POST'
    });
    return res.json();
  },
  // ... resto de endpoints
};
```

#### 3.4.2 Integración WebSocket

**Crear `src/hooks/useLiveData.ts`:**

```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useLiveData = () => {
  const [data, setData] = useState<LiveData | null>(null);
  
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL);
    
    socket.on('live_data', (newData) => {
      setData(newData);
    });
    
    socket.emit('request_live_data');
    
    return () => socket.disconnect();
  }, []);
  
  return data;
};
```

#### 3.4.3 Variables de Entorno

**Crear `.env.local` en IA/project_kimi/:**

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=ws://localhost:5000
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=info
```

---

## 4. DESPLIEGUE EN RASPBERRY PI

### 4.1 Requisitos de Hardware

```
┌─────────────────────────────────────────────┐
│         RASPBERRY PI 3/4 REQUERIMIENTOS      │
├─────────────────────────────────────────────┤
│ Mínimo RAM:        2 GB                     │
│ Procesador:        ARM7 (RPi3) / ARM8 (RPi4)│
│ Almacenamiento:    16 GB microSD (recom. 32)│
│ Alimentación:      5V/3A (RPi3) o 5V/5A (RPi4)
│ Red:               Ethernet (recomendado)   │
│ USB:               Puerto para DAQ          │
│ GPIO:              Pin header para relés    │
│ Periféricos:       Heatsink + ventilador    │
└─────────────────────────────────────────────┘
```

### 4.2 Preparación del Sistema Operativo

#### 4.2.1 Instalación Base

```bash
# 1. Descargar Raspberry Pi OS (Bookworm, 64-bit recomendado)
# https://www.raspberrypi.com/software/

# 2. Flashear imagen a microSD (usar Raspberry Pi Imager)

# 3. Configuración inicial
sudo raspi-config
# - Hostname: labpipanel-rpi
# - Interfacing Options -> SSH: Enable
# - Interfacing Options -> GPIO: Enable
# - Network -> Set static IP (ejemplo: 192.168.1.50)
# - Localization -> Timezone: America/Bogota
```

#### 4.2.2 Dependencias del Sistema

```bash
#!/bin/bash
# script: setup-rpi-environment.sh

sudo apt-get update && sudo apt-get upgrade -y

# Herramientas básicas
sudo apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    nano \
    htop \
    iotop

# Python 3.11
sudo apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3-pip

# Node.js (para compilación del frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# USB y GPIO
sudo apt-get install -y \
    libusb-1.0-0 \
    libusb-1.0-0-dev \
    libusb-dev \
    librpi-gpio-dev

# Docker (recomendado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# MCC Linux Drivers (para DAQ USB-5203)
# Seguir instrucciones del fabricante
# https://www.mccdaq.com/
```

### 4.3 Despliegue sin Docker (Recomendado para Desarrollo)

#### 4.3.1 Instalación del Proyecto

```bash
#!/bin/bash
# script: deploy-native.sh

# Variables
DEPLOY_DIR="/home/pi/LabPiPanel"
REPO_URL="https://github.com/mutatronik-qa/LabPiPanel.git"
BRANCH="main"

# Clonar repositorio
cd /home/pi
git clone -b $BRANCH $REPO_URL
cd $DEPLOY_DIR

# Entorno virtual para backend
python3.11 -m venv venv_backend
source venv_backend/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Frontend (compilación)
cd IA/project_kimi
npm install
npm run build

# Crear servicio systemd para backend
sudo tee /etc/systemd/system/labpipanel.service > /dev/null <<EOF
[Unit]
Description=LabPiPanel Thermal Lab Control System
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$DEPLOY_DIR
Environment="PATH=$DEPLOY_DIR/venv_backend/bin"
ExecStart=$DEPLOY_DIR/venv_backend/bin/python labpipanel.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable labpipanel
sudo systemctl start labpipanel
```

#### 4.3.2 Servicio Web para Frontend

```bash
# Opción 1: Nginx (recomendado)
sudo apt-get install -y nginx

# Configurar sitio Nginx
sudo tee /etc/nginx/sites-available/labpipanel > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    root $DEPLOY_DIR/IA/project_kimi/dist;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/labpipanel /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 4.4 Despliegue con Docker (Alternativa)

#### 4.4.1 Actualización de Dockerfile

```dockerfile
# Dockerfile - ACTUALIZADO para ARM64 + Frontend Kimi

FROM --platform=linux/arm64 python:3.11-slim-bookworm as backend-builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libusb-1.0-0-dev \
    libusb-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Frontend builder
FROM --platform=linux/arm64 node:20-bookworm as frontend-builder

WORKDIR /app

COPY IA/project_kimi/package*.json ./
RUN npm ci

COPY IA/project_kimi . 
RUN npm run build

# Runtime
FROM --platform=linux/arm64 python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libusb-1.0-0 \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY labpipanel.py config.py fuente_xln.py daq_usb5203.py relay_controller.py thermal_experiment.py /app/

RUN mkdir -p /app/logs /app/results

EXPOSE 5000 80

CMD ["sh", "-c", "python labpipanel.py & nginx -g 'daemon off;'"]
```

#### 4.4.2 Docker Compose Actualizado

```yaml
version: '3.8'

services:
  labpipanel:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILDPLATFORM=linux/arm64
    image: labpipanel:latest-arm64
    container_name: labpipanel
    hostname: labpipanel
    restart: unless-stopped
    
    ports:
      - "80:80"     # Frontend
      - "5000:5000" # API
    
    environment:
      FLASK_HOST: 0.0.0.0
      FLASK_PORT: 5000
      FLASK_DEBUG: "False"
      XLN_HOST: "192.168.1.100"
      XLN_PORT: "5024"
      PYTHONUNBUFFERED: "1"
      TZ: "America/Bogota"
    
    volumes:
      - /dev/bus/usb:/dev/bus/usb:rw
      - /sys/class/gpio:/sys/class/gpio:rw
      - ./logs:/app/logs
      - ./results:/app/results
      - ./.env:/app/.env:ro
    
    devices:
      - /dev/mem:/dev/mem
      - /dev/gpiomem:/dev/gpiomem
    
    privileged: true
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 4.5 Configuración de Permisos GPIO

```bash
#!/bin/bash
# script: setup-gpio.sh

# Crear grupo gpio (si no existe)
sudo groupadd -f gpio

# Agregar usuario pi al grupo
sudo usermod -a -G gpio pi

# Configurar permisos
echo 'SUBSYSTEM=="gpio", GROUP="gpio", MODE="0660"' | sudo tee /etc/udev/rules.d/99-gpio.rules
echo 'SUBSYSTEM=="gpio*", PROGRAM="/bin/sh -c \"find /sys/class/gpio -name \'gpiochip*\' | grep -o \'gpio[0-9]*\' | head -1\"", SYMLINK+=\"gpio%S{name}\"' | sudo tee -a /etc/udev/rules.d/99-gpio.rules

# Recargar reglas udev
sudo udevadm control --reload-rules
sudo udevadm trigger
```

---

## 5. PLAN DE INTEGRACIÓN PASO A PASO

### FASE 1: PREPARACIÓN (Duración: 2-3 horas)

- [ ] **5.1.1** Backup actual del proyecto: `git tag backup-bolt-frontend`
- [ ] **5.1.2** Revisar completamente el código Kimi IA
- [ ] **5.1.3** Extraer componentes desde la URL compartida (copiar/pegar código fuente)
- [ ] **5.1.4** Crear rama de desarrollo: `git checkout -b feat/integrate-kimi-frontend`
- [ ] **5.1.5** Crear estructura de directorios: `mkdir -p IA/project_kimi backend/api`

### FASE 2: INTEGRACIÓN BACKEND (Duración: 4-6 horas)

- [ ] **5.2.1** Reorganizar archivos Python en `backend/`
- [ ] **5.2.2** Agregar soporte WebSocket a `labpipanel.py`
- [ ] **5.2.3** Implementar `/api/config` endpoint
- [ ] **5.2.4** Agregar validación de esquemas (schemas.py)
- [ ] **5.2.5** Habilitar CORS en Flask
- [ ] **5.2.6** Crear `.env.example` con nuevas variables
- [ ] **5.2.7** Testing local: `python labpipanel.py`

### FASE 3: INTEGRACIÓN FRONTEND (Duración: 6-8 horas)

- [ ] **5.3.1** Copiar componentes Kimi a `IA/project_kimi/src/components/`
- [ ] **5.3.2** Crear cliente API (`src/utils/apiClient.ts`)
- [ ] **5.3.3** Crear hooks personalizados (`src/hooks/`)
- [ ] **5.3.4** Actualizar types (sincronizar con backend)
- [ ] **5.3.5** Integrar WebSocket (socket.io)
- [ ] **5.3.6** Crear `.env.local` con variables
- [ ] **5.3.7** Testing en desarrollo: `npm run dev`
- [ ] **5.3.8** Build: `npm run build`

### FASE 4: PRUEBAS INTEGRACIÓN (Duración: 3-4 horas)

- [ ] **5.4.1** Test en localhost: Frontend + Backend
- [ ] **5.4.2** Verificar conexión a fuente XLN (simulada)
- [ ] **5.4.3** Verificar lectura DAQ (simulada)
- [ ] **5.4.4** Verificar control relés (GPIO)
- [ ] **5.4.5** Test grabación CSV
- [ ] **5.4.6** Prueba de alertas y límites

### FASE 5: PREPARACIÓN RASPBERRY PI (Duración: 2-3 horas)

- [ ] **5.5.1** Flashear Raspberry Pi OS Bookworm 64-bit
- [ ] **5.5.2** Ejecutar script `setup-rpi-environment.sh`
- [ ] **5.5.3** Instalar drivers MCC Linux
- [ ] **5.5.4** Configurar red (IP fija, hostname)
- [ ] **5.5.5** Configurar SSH para acceso remoto

### FASE 6: DESPLIEGUE EN RPi (Duración: 2-3 horas)

- [ ] **5.6.1** Elegir estrategia: Native o Docker
- [ ] **5.6.2** Ejecutar script de despliegue
- [ ] **5.6.3** Configurar servicio systemd (si native)
- [ ] **5.6.4** Crear servicio de auto-inicio
- [ ] **5.6.5** Verificar logs: `journalctl -u labpipanel -f`

### FASE 7: PRUEBAS EN LABORATORIO (Duración: 4-6 horas)

- [ ] **5.7.1** Conexión física: Fuente + DAQ + Relés
- [ ] **5.7.2** Test de conectividad de fuente
- [ ] **5.7.3** Calibración de termopares
- [ ] **5.7.4** Test de relés (bomba, ventiladores)
- [ ] **5.7.5** Experimento de prueba
- [ ] **5.7.6** Validación de datos en CSV
- [ ] **5.7.7** Documentación de resultados

**TIEMPO TOTAL ESTIMADO: 23-33 horas**

---

## 6. CONSIDERACIONES CRÍTICAS DE SEGURIDAD

### 6.1 Límites Operacionales

```python
# En config.py - Establecer límites máximos
SAFETY_LIMITS = {
    'XLN_VOLTAGE_MAX': 280.0,      # < 300V (margen)
    'XLN_CURRENT_MAX': 5.0,        # < 5.2A (margen)
    'XLN_POWER_MAX': 1400.0,       # < 1500W (margen)
    'TEMP_ALARM_HIGH': 120.0,      # °C
    'TEMP_ALARM_LOW': -40.0,       # °C
    'WATCHDOG_TIMEOUT': 30,        # segundos sin comunicación
}
```

### 6.2 Protecciones Implementar

**6.2.1 Watchdog Timer:**
```python
def watchdog_check():
    """Verificar estado del sistema cada 5 segundos"""
    if time.time() - last_communication > WATCHDOG_TIMEOUT:
        fuente.output_off()
        logger.critical("Watchdog: Apagando fuente por timeout")
```

**6.2.2 Validación de Rango:**
```python
def validate_parameter(value, min_val, max_val):
    if not (min_val <= value <= max_val):
        raise ValueError(f"Valor {value} fuera de rango [{min_val}, {max_val}]")
    return value
```

**6.2.3 Confirmación de Operaciones Peligrosas:**
```typescript
// En frontend
async function setHighVoltage(voltage: number) {
    if (voltage > 100) {
        const confirm = await showConfirmDialog(
            `¿Confirmar ${voltage}V? Marque 'CONFIRMAR' para proceder.`
        );
        if (!confirm) return;
    }
    // Enviar comando
}
```

### 6.3 Monitoreo Continuo

- **Temperatura:** Alertas si > 120°C o < -40°C
- **Voltaje:** Protección OVP a 310V
- **Corriente:** Protección OCP a 5.5A
- **Potencia:** Límite a 1500W
- **Conexión:** Verificar estado cada 5 segundos

---

## 7. TROUBLESHOOTING ESPERADO

### 7.1 Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|---|---|
| Frontend no conecta a backend | CORS no habilitado | Agregar `CORS(app)` en Flask |
| Datos no se actualizan | WebSocket no funciona | Verificar `socket.io` en cliente |
| GPIO no responde | Permisos insuficientes | Ejecutar: `sudo usermod -aG gpio pi` |
| DAQ no detecta | Driver MCC no instalado | Instalar drivers del fabricante |
| Fuente Telnet error | IP incorrecta | Verificar red: `ping 192.168.1.100` |
| Alto uso CPU en RPi3 | Frecuencia muestreo muy alta | Reducir de 100Hz a 50Hz |
| Crash de Node en RPi | Memoria insuficiente | Aumentar swap: `dphys-swapfile` |

### 7.2 Debugging

```bash
# Backend logs
journalctl -u labpipanel -f -n 100

# Verificar puerto
sudo netstat -tlpn | grep 5000

# Test API
curl http://localhost:5000/api/status

# Monitoreo CPU/RAM
htop

# Logs del frontend (navegador)
# F12 -> Console -> Network tabs
```

---

## 8. OPTIMIZACIONES PARA RASPBERRY PI

### 8.1 Rendimiento Frontend

```typescript
// src/App.tsx - Optimizaciones

// 1. Memoización de componentes
const MemoChart = memo(RealtimeCharts);

// 2. Lazy loading
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));

// 3. Limitar puntos de datos en gráfico
const MAX_DATA_POINTS = 150; // En lugar de 300 para RPi3

// 4. Usar canvas en lugar de SVG para gráficos
```

### 8.2 Rendimiento Backend

```python
# labpipanel.py - Optimizaciones

# 1. Caché de estado
from functools import lru_cache
@lru_cache(maxsize=1)
def get_cached_status():
    return {...}

# 2. Limitar frecuencia de consultas
QUERY_INTERVAL = 0.1  # 100ms mínimo

# 3. Comprimir respuestas
from flask_compress import Compress
Compress(app)
```

### 8.3 Recursos del Sistema

```bash
# Reducir uso de memoria
sudo nano /boot/cmdline.txt
# Agregar: vm.swappiness=10

# Optimizar temperatura
sudo raspi-config
# -> Performance Options -> GPU memory (reduce a 16MB)

# Monitoreo térmico
sudo apt-get install -y lm-sensors
vcgencmd measure_temp  # Ver temperatura actual
```

---

## 9. DOCUMENTACIÓN NECESARIA

### 9.1 Archivos a Crear/Actualizar

```markdown
LabPiPanel/
├── DEPLOYMENT.md           [Guía de despliegue]
├── DEVELOPMENT.md          [Guía de desarrollo]
├── API.md                  [Documentación API actualizada]
├── FRONTEND_INTEGRATION.md [Guía específica de frontend]
├── HARDWARE_SETUP.md       [Configuración de hardware]
└── TROUBLESHOOTING.md      [Solución de problemas]
```

### 9.2 Checklist de Documentación

- [ ] README.md: Actualizar con instrucciones frontend Kimi
- [ ] API.md: Documentar nuevos endpoints (`/api/config`, WebSocket)
- [ ] .env.example: Actualizar variables de configuración
- [ ] Dockerfile: Comentarios sobre ARM64
- [ ] DEPLOYMENT.md: Nuevas guías de despliegue
- [ ] CHANGELOG.md: Registrar cambios

---

## 10. MÉTRICAS DE ÉXITO

### 10.1 Funcionalidad

✅ Todos los gráficos muestran datos en tiempo real  
✅ Control de fuente responde en < 1 segundo  
✅ Relés cambian estado de forma confiable  
✅ Grabación CSV sin errores  
✅ Alertas se disparan correctamente  

### 10.2 Rendimiento

✅ Frontend carga en < 3 segundos en RPi4  
✅ Uso CPU < 50% en RPi4, < 80% en RPi3  
✅ Uso RAM < 512MB en operación normal  
✅ Respuesta API < 500ms promedio  

### 10.3 Confiabilidad

✅ Uptime > 48 horas sin interrupciones  
✅ Recuperación automática ante desconexión  
✅ Logs registran todos los eventos críticos  
✅ CSV sin datos corruptos  

---

## 11. RECOMENDACIONES FINALES

### 11.1 Prioridades de Implementación

1. **Alta Prioridad (Semana 1):**
   - Agregar soporte WebSocket al backend
   - Integrar cliente API en frontend
   - Desplegar en RPi y validar hardware

2. **Media Prioridad (Semana 2):**
   - Optimizar rendimiento para RPi3
   - Implementar persistencia de configuración
   - Mejorar sistema de alertas

3. **Baja Prioridad (Semana 3+):**
   - Base de datos de histórico
   - Análisis avanzado de datos
   - Interfaz de móvil

### 11.2 Stack Recomendado Final

```
Frontend:     React 18 + Vite + TypeScript + TailwindCSS
Charting:     Recharts o Chart.js (reemplazar canvas manual)
Backend:      Flask + flask-socketio + flask-cors
Database:     SQLite (RPi) o PostgreSQL (servidor)
Deployment:   Docker Compose (preferible a native)
Monitoring:   Prometheus + Grafana (opcional)
```

### 11.3 Próximos Pasos Inmediatos

1. **Esta semana:**
   - Revisar estructura del código Kimi
   - Preparar rama git
   - Crear script de setupRaspberry Pi

2. **Semana siguiente:**
   - Implementar cambios backend
   - Integrar componentes frontend
   - Pruebas en desarrollo

3. **Semana 3:**
   - Despliegue en Raspberry Pi
   - Pruebas con hardware real
   - Validación en laboratorio

---

## CONCLUSIONES Y AUTORIZACIÓN

### Conclusión Técnica

La integración del frontend Kimi IA **ES VIABLE Y RECOMENDADA**. Las mejoras en visualización de datos, gestión de configuración y sistema de alertas justifican claramente el esfuerzo de integración. La arquitectura actual de LabPiPanel está bien estructurada para soportar esta integración sin cambios disruptivos en el backend.

**Riesgos Identificados: BAJOS** (Requiere principalmente trabajo de integración, no rediseño)

**Beneficios Esperados:**
- Mejor experiencia de usuario
- Gráficos más profesionales
- Control más granular del sistema
- Preparación para futuras mejoras

---

**Reporte Generado:** 4 de febrero de 2026  
**Responsable:** Análisis Técnico Automatizado  
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN

---

## ANEXOS

### A. Estructura de Configuración Propuesta

```json
{
  "system": {
    "hostname": "labpipanel-rpi",
    "timezone": "America/Bogota",
    "log_level": "INFO"
  },
  "fuente": {
    "host": "192.168.1.100",
    "port": 5024,
    "limits": {
      "voltage_max": 280,
      "current_max": 5.0,
      "power_max": 1400
    }
  },
  "daq": {
    "sample_rate": 100,
    "channels": 8,
    "thermocouple_type": "K"
  },
  "safety": {
    "temp_alarm_high": 120,
    "temp_alarm_low": -40,
    "watchdog_timeout": 30
  },
  "frontend": {
    "api_url": "http://localhost:5000/api",
    "ws_url": "ws://localhost:5000",
    "update_interval": 100
  }
}
```

### B. Matriz de Compatibilidad

| Componente | RPi3 | RPi4 | RPi5 |
|-----------|------|------|------|
| Python 3.11 | ✅ | ✅ | ✅ |
| Node.js 20 | ⚠️ | ✅ | ✅ |
| Docker | ⚠️ | ✅ | ✅ |
| GPIO | ✅ | ✅ | ✅ |
| USB DAQ | ✅ | ✅ | ✅ |
| Ethernet | ✅ | ✅ | ✅ |

(⚠️ = Requiere configuración especial, como aumento de swap)

---

**FIN DEL REPORTE**
