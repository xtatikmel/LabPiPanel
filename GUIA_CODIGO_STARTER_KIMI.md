# GUÍA DE IMPLEMENTACIÓN: CÓDIGO STARTER PARA INTEGRACIÓN KIMI

**Documento:** Fragmentos de código listos para usar  
**Fecha:** 4 de febrero de 2026  
**Proyecto:** LabPiPanel + Frontend Kimi

---

## 1. MODIFICACIONES BACKEND

### 1.1 Actualización de labpipanel.py

Reemplaza el inicio del archivo con esto:

```python
"""
LabPiPanel - Sistema de Control de Laboratorio Térmico
Instituto Tecnológico Metropolitano (ITM) - Medellín, Colombia
Servidor Flask con API REST y WebSocket para frontend Kimi

Cambios v1.1:
- Soporte WebSocket con socket.io
- CORS habilitado
- Nuevos endpoints /api/config
- Manejo de configuración persistente
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime
from pathlib import Path
import threading
import time
import json

import config
from fuente_xln import FuenteXLN
from daq_usb5203 import DAQUSB5203
from relay_controller import RelayController
from thermal_experiment import ThermalExperiment

app = Flask(__name__)

# ========== CONFIGURACIÓN CORS Y WEBSOCKET ==========
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=False
)

# ========== LOGGING ==========
logging.basicConfig(
    level=logging.INFO,
    format=config.LOG_FORMAT,
    datefmt=config.LOG_DATE_FORMAT
)

file_handler = RotatingFileHandler(
    config.LOG_FILE,
    maxBytes=config.LOG_MAX_BYTES,
    backupCount=config.LOG_BACKUP_COUNT
)
file_handler.setFormatter(logging.Formatter(config.LOG_FORMAT))
app.logger.addHandler(file_handler)

logger = logging.getLogger(__name__)

# ========== INICIALIZACIÓN HARDWARE ==========
fuente = FuenteXLN(config.XLN_HOST, config.XLN_PORT, config.XLN_TIMEOUT)
daq = DAQUSB5203(config.DAQ_CHANNELS, config.DAQ_THERMOCOUPLE_TYPE, config.DAQ_TIMEOUT)
relay = RelayController(config.RELAY_PINS)
experiment_controller = ThermalExperiment(fuente, daq, relay, config.RESULTS_DIR)

logger.info("=" * 80)
logger.info("LabPiPanel v1.1 - Sistema de Control de Laboratorio Térmico")
logger.info("Instituto Tecnológico Metropolitano (ITM) - Medellín, Colombia")
logger.info("=" * 80)

# ========== VARIABLES GLOBALES ==========
current_recording_file = None
live_data_clients = set()


# ========== FUNCIONES AUXILIARES ==========
def load_config_from_file():
    """Carga configuración desde archivo JSON"""
    config_file = Path("config/system.json")
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"No se pudo cargar config desde archivo: {e}")
    
    return {
        "fuente": {
            "host": config.XLN_HOST,
            "port": config.XLN_PORT,
            "limits": {
                "voltage_max": config.XLN_VOLTAGE_MAX,
                "current_max": config.XLN_CURRENT_MAX,
                "power_max": 1500.0
            }
        },
        "daq": {
            "sample_rate": 100,
            "channels": config.DAQ_CHANNELS,
            "thermocouple_type": config.DAQ_THERMOCOUPLE_TYPE
        },
        "safety": {
            "temp_alarm_high": 120.0,
            "temp_alarm_low": -40.0,
            "watchdog_timeout": 30
        }
    }


def save_config_to_file(config_data):
    """Guarda configuración en archivo JSON"""
    config_dir = Path("config")
    config_dir.mkdir(exist_ok=True)
    
    config_file = config_dir / "system.json"
    try:
        with open(config_file, 'w') as f:
            json.dump(config_data, f, indent=2)
        logger.info(f"Configuración guardada en {config_file}")
        return True
    except Exception as e:
        logger.error(f"Error guardando configuración: {e}")
        return False


def gather_live_data():
    """Recopila todos los datos del sistema en tiempo real"""
    try:
        voltage = fuente.get_voltage() or 0
        current = fuente.get_current() or 0
        power = voltage * current
        
        temperatures = {}
        for ch in range(config.DAQ_CHANNELS):
            try:
                temperatures[f'T_ch{ch}'] = daq.get_temperature(ch) or 0
            except:
                temperatures[f'T_ch{ch}'] = 0
        
        # Calcular promedios
        evap_temps = [temperatures.get(k, 0) for k in ['T_ch0', 'T_ch1', 'T_ch2', 'T_ch3']]
        cond_temps = [temperatures.get(k, 0) for k in ['T_ch4', 'T_ch5', 'T_ch6', 'T_ch7']]
        
        T_evap_avg = sum(evap_temps) / len(evap_temps) if evap_temps else 0
        T_cond_avg = sum(cond_temps) / len(cond_temps) if cond_temps else 0
        
        # Resistencia térmica
        R_thermal = 0
        if power > 0 and T_evap_avg > T_cond_avg:
            R_thermal = (T_evap_avg - T_cond_avg) / power
        
        relay_states = relay.get_all_states()
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'voltaje': round(voltage, 2),
            'corriente': round(current, 3),
            'potencia': round(power, 1),
            'T_ch0': round(temperatures['T_ch0'], 2),
            'T_ch1': round(temperatures['T_ch1'], 2),
            'T_ch2': round(temperatures['T_ch2'], 2),
            'T_ch3': round(temperatures['T_ch3'], 2),
            'T_ch4': round(temperatures['T_ch4'], 2),
            'T_ch5': round(temperatures['T_ch5'], 2),
            'T_ch6': round(temperatures['T_ch6'], 2),
            'T_ch7': round(temperatures['T_ch7'], 2),
            'T_evap_avg': round(T_evap_avg, 2),
            'T_cond_avg': round(T_cond_avg, 2),
            'R_thermal': round(R_thermal, 4),
            'relay_1': relay_states.get('RELAY_1', False),
            'relay_2': relay_states.get('RELAY_2', False),
            'relay_3': relay_states.get('RELAY_3', False),
            'relay_4': relay_states.get('RELAY_4', False),
        }
        
        return data
    except Exception as e:
        logger.error(f"Error recopilando datos en vivo: {e}")
        return None


# ========== RUTAS HTTP ==========

@app.route('/')
def index():
    """Página principal del sistema"""
    return render_template('index.html')


@app.route('/api/status', methods=['GET'])
def api_status():
    """Estado general del sistema"""
    try:
        fuente_connected = fuente.is_connected() or fuente.connect()
        
        return jsonify({
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "fuente": "connected" if fuente_connected else "disconnected",
                "daq": "ready",
                "relays": relay.get_all_states(),
                "experiment": experiment_controller.get_experiment_status()
            }
        }), 200
    except Exception as e:
        logger.error(f"Error en /api/status: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/config', methods=['GET', 'POST'])
def api_config():
    """Obtener o guardar configuración del sistema"""
    try:
        if request.method == 'GET':
            config_data = load_config_from_file()
            return jsonify(config_data), 200
        
        elif request.method == 'POST':
            config_data = request.get_json()
            
            # Validación básica
            if not config_data:
                return jsonify({"status": "error", "message": "Datos vacíos"}), 400
            
            # Guardar
            if save_config_to_file(config_data):
                return jsonify({
                    "status": "ok",
                    "message": "Configuración guardada"
                }), 200
            else:
                return jsonify({
                    "status": "error",
                    "message": "Error guardando configuración"
                }), 500
    
    except Exception as e:
        logger.error(f"Error en /api/config: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ========== WEBSOCKET ==========

@socketio.on('connect')
def handle_connect():
    """Cliente WebSocket conecta"""
    logger.info(f"Cliente conectado: {request.sid}")
    emit('response', {'status': 'connected'})


@socketio.on('disconnect')
def handle_disconnect():
    """Cliente WebSocket desconecta"""
    logger.info(f"Cliente desconectado: {request.sid}")
    live_data_clients.discard(request.sid)


@socketio.on('request_live_data')
def handle_live_data_request():
    """Inicia envío de datos en vivo"""
    live_data_clients.add(request.sid)
    logger.info(f"Cliente {request.sid} solicitó datos en vivo")
    emit('response', {'status': 'live_data_started'})


@socketio.on('stop_live_data')
def handle_stop_live_data():
    """Detiene envío de datos en vivo"""
    live_data_clients.discard(request.sid)
    logger.info(f"Cliente {request.sid} detuvo datos en vivo")


# Thread para emitir datos cada 100ms
def broadcast_live_data():
    """Emite datos en vivo a todos los clientes cada 100ms"""
    while True:
        try:
            if live_data_clients:
                data = gather_live_data()
                if data:
                    socketio.emit('live_data', data, room=list(live_data_clients))
            time.sleep(0.1)  # 100ms
        except Exception as e:
            logger.error(f"Error en broadcast_live_data: {e}")
            time.sleep(1)


# Iniciar thread de broadcast
live_data_thread = threading.Thread(target=broadcast_live_data, daemon=True)
live_data_thread.start()


# ========== MAIN ==========

if __name__ == '__main__':
    logger.info(f"Iniciando servidor en {config.FLASK_HOST}:{config.FLASK_PORT}")
    socketio.run(
        app,
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG,
        allow_unsafe_werkzeug=True
    )
```

### 1.2 Actualizar requirements.txt

Asegúrate que contiene:

```
Flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.5
python-socketio==5.10.0
python-engineio==4.8.0
RPi.GPIO==0.7.1
telnetlib3==1.0.4
mcculw==2.3.1
pyusb==1.2.1
python-dotenv==1.0.0
```

---

## 2. ARCHIVOS FRONTEND PARA CREAR

### 2.1 src/utils/apiClient.ts

```typescript
/**
 * Cliente API para comunicación con backend
 * LabPiPanel v1.1
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  status: 'ok' | 'error' | 'warning';
  data?: T;
  message?: string;
}

export const apiClient = {
  /**
   * Obtener estado general del sistema
   */
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Obtener configuración actual
   */
  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Guardar configuración
   */
  async saveConfig(config: any) {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Configurar voltaje de la fuente
   */
  async setVoltage(voltage: number, confirm: boolean = false) {
    const res = await fetch(`${API_BASE}/fuente/voltage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voltage, confirm })
    });
    return res.json();
  },

  /**
   * Configurar corriente de la fuente
   */
  async setCurrent(current: number) {
    const res = await fetch(`${API_BASE}/fuente/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current })
    });
    return res.json();
  },

  /**
   * Encender/Apagar fuente
   */
  async setOutput(state: 'on' | 'off') {
    const res = await fetch(`${API_BASE}/fuente/output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    return res.json();
  },

  /**
   * Controlar relé individual
   */
  async setRelay(relayNum: 1 | 2 | 3 | 4, state: boolean) {
    const res = await fetch(`${API_BASE}/relay/${relayNum}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    return res.json();
  },

  /**
   * Iniciar grabación
   */
  async startRecording() {
    const res = await fetch(`${API_BASE}/recording/start`, {
      method: 'POST'
    });
    return res.json();
  },

  /**
   * Detener grabación
   */
  async stopRecording() {
    const res = await fetch(`${API_BASE}/recording/stop`, {
      method: 'POST'
    });
    return res.json();
  }
};

/**
 * Error handling wrapper
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('API Error:', err);
    errorHandler?.(err);
    return null;
  }
}
```

### 2.2 src/hooks/useLiveData.ts

```typescript
/**
 * Hook personalizado para datos en vivo via WebSocket
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { LiveData } from '../types';

const WS_URL = import.meta.env.VITE_API_WS_URL || 'http://localhost:5000';

interface UseLiveDataReturn {
  data: LiveData | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useLiveData(): UseLiveDataReturn {
  const [data, setData] = useState<LiveData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Crear conexión WebSocket
    const socket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Handlers
    socket.on('connect', () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setError(null);
      socket.emit('request_live_data');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    });

    socket.on('live_data', (newData: LiveData) => {
      setData(newData);
    });

    socket.on('error', (err: any) => {
      console.error('WebSocket error:', err);
      setError(err?.message || 'Error desconocido');
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('stop_live_data');
        socket.disconnect();
      }
    };
  }, []);

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return { data, isConnected, error, reconnect };
}
```

### 2.3 src/hooks/useFuenteControl.ts

```typescript
/**
 * Hook para control de fuente
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';

interface FuenteState {
  voltage: number;
  current: number;
  outputEnabled: boolean;
  power: number;
}

interface UseFuenteControlReturn extends FuenteState {
  setVoltage: (v: number) => Promise<boolean>;
  setCurrent: (i: number) => Promise<boolean>;
  toggleOutput: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useFuenteControl(): UseFuenteControlReturn {
  const [state, setState] = useState<FuenteState>({
    voltage: 0,
    current: 0,
    outputEnabled: false,
    power: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setVoltage = useCallback(async (voltage: number) => {
    if (voltage < 0 || voltage > 300) {
      setError('Voltaje debe estar entre 0-300V');
      return false;
    }

    try {
      setIsLoading(true);
      const confirm = voltage > 100;
      const result = await apiClient.setVoltage(voltage, confirm);

      if (result.status === 'ok') {
        setState(prev => ({
          ...prev,
          voltage,
          power: voltage * prev.current
        }));
        setError(null);
        return true;
      } else {
        setError(result.message || 'Error configurando voltaje');
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrent = useCallback(async (current: number) => {
    if (current < 0 || current > 5.2) {
      setError('Corriente debe estar entre 0-5.2A');
      return false;
    }

    try {
      setIsLoading(true);
      const result = await apiClient.setCurrent(current);

      if (result.status === 'ok') {
        setState(prev => ({
          ...prev,
          current,
          power: prev.voltage * current
        }));
        setError(null);
        return true;
      } else {
        setError(result.message || 'Error configurando corriente');
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleOutput = useCallback(async () => {
    try {
      setIsLoading(true);
      const newState = !state.outputEnabled;
      const result = await apiClient.setOutput(newState ? 'on' : 'off');

      if (result.status === 'ok') {
        setState(prev => ({ ...prev, outputEnabled: newState }));
        setError(null);
        return true;
      } else {
        setError(result.message || 'Error cambiando salida');
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.outputEnabled]);

  return {
    voltage: state.voltage,
    current: state.current,
    outputEnabled: state.outputEnabled,
    power: state.power,
    setVoltage,
    setCurrent,
    toggleOutput,
    isLoading,
    error
  };
}
```

### 2.4 .env.local

```env
# Backend API
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=http://localhost:5000

# Entorno
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug

# Configuración frontend
VITE_SAMPLE_RATE=100
VITE_MAX_DATA_POINTS=150
```

---

## 3. SCRIPTS DE DESPLIEGUE

### 3.1 scripts/setup-rpi.sh

```bash
#!/bin/bash
# Script de configuración para Raspberry Pi
# Ejecutar: chmod +x setup-rpi.sh && ./setup-rpi.sh

set -e

echo "======================================="
echo "Setup LabPiPanel en Raspberry Pi"
echo "======================================="

# Actualizar sistema
echo "[1/7] Actualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Python 3.11
echo "[2/7] Instalando Python 3.11..."
sudo apt-get install -y python3.11 python3.11-dev python3.11-venv python3-pip

# Instalar Node.js
echo "[3/7] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Instalar dependencias del sistema
echo "[4/7] Instalando dependencias del sistema..."
sudo apt-get install -y \
    build-essential \
    libusb-1.0-0 \
    libusb-1.0-0-dev \
    librpi-gpio-dev \
    curl \
    wget \
    git \
    nano

# Instalar Docker (opcional)
echo "[5/7] Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi
rm get-docker.sh

# Clonar repositorio
echo "[6/7] Clonando repositorio..."
cd /home/pi
if [ ! -d "LabPiPanel" ]; then
    git clone https://github.com/mutatronik-qa/LabPiPanel.git
    cd LabPiPanel
else
    cd LabPiPanel
    git pull origin main
fi

# Setup backend
echo "[7/7] Configurando backend..."
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "======================================="
echo "Setup completado!"
echo "======================================="
echo ""
echo "Próximos pasos:"
echo "1. Instalar drivers MCC Linux para DAQ:"
echo "   https://www.mccdaq.com/"
echo ""
echo "2. Iniciar backend:"
echo "   cd /home/pi/LabPiPanel"
echo "   source venv/bin/activate"
echo "   python labpipanel.py"
echo ""
echo "3. Acceder a:"
echo "   http://$(hostname -I | awk '{print $1}'):5000"
```

### 3.2 scripts/deploy-native.sh

```bash
#!/bin/bash
# Script de despliegue nativo (sin Docker)

set -e

DEPLOY_DIR="/home/pi/LabPiPanel"
cd $DEPLOY_DIR

echo "Desplegando LabPiPanel (nativo)..."

# Actualizar código
git pull origin main

# Backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd IA/project_kimi
npm install
npm run build
cd ../..

# Crear servicio systemd
echo "Creando servicio systemd..."
sudo tee /etc/systemd/system/labpipanel.service > /dev/null <<EOF
[Unit]
Description=LabPiPanel Thermal Lab Control System
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$DEPLOY_DIR
Environment="PATH=$DEPLOY_DIR/venv/bin"
ExecStart=$DEPLOY_DIR/venv/bin/python labpipanel.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar y iniciar
sudo systemctl daemon-reload
sudo systemctl enable labpipanel
sudo systemctl restart labpipanel

echo "Servicio creado y iniciado!"
echo "Ver logs: sudo journalctl -u labpipanel -f"
```

---

## 4. CONFIGURACIÓN NGINX

Crear `/etc/nginx/sites-available/labpipanel`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    # Servir frontend desde dist
    root /home/pi/LabPiPanel/IA/project_kimi/dist;
    
    # Reescribir para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy a API backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/labpipanel /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 5. VARIABLES DE ENTORNO

Crear `.env` en raíz del proyecto:

```bash
# Flask
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False

# Fuente XLN
XLN_HOST=192.168.1.100
XLN_PORT=5024
XLN_TIMEOUT=10

# DAQ USB
DAQ_TIMEOUT=10

# Resultados
RESULTS_DIR=./results

# Logging
LOG_FILE=./logs/labpipanel.log
LOG_LEVEL=INFO
```

---

## 6. TESTING RÁPIDO

### Test API local

```bash
# En un terminal
python labpipanel.py

# En otro terminal
curl http://localhost:5000/api/status
curl http://localhost:5000/api/config
```

### Test Frontend local

```bash
cd IA/project_kimi
npm run dev
# Acceder a http://localhost:5173
```

---

## RESUMEN DE IMPLEMENTACIÓN

1. **Backend:**
   - Copiar código actualizado a `labpipanel.py`
   - Actualizar `requirements.txt`
   - Crear `config/system.json`

2. **Frontend:**
   - Crear carpeta `src/utils/` y `src/hooks/`
   - Crear archivos `apiClient.ts`, `useLiveData.ts`, `useFuenteControl.ts`
   - Crear `.env.local`

3. **Despliegue:**
   - Ejecutar `setup-rpi.sh` en RPi
   - Usar `deploy-native.sh` o Docker Compose
   - Configurar Nginx como reverse proxy

4. **Testing:**
   - Verificar API: `curl http://localhost:5000/api/status`
   - Acceder frontend: `http://localhost`
   - Monitorear logs: `journalctl -u labpipanel -f`

---

**Tiempo estimado para implementación: 6-8 horas**  
**Documentación generada: 4 de febrero de 2026**
