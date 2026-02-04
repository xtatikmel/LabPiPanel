# 📊 ANÁLISIS ESTRUCTURA EXPERIMENTAL - LabPiPanel 2026

**Fecha**: 4 de febrero de 2026  
**Objetivo**: Integrar Experimento Térmico Automatizado con nueva arquitectura monorepo  
**Versión Anterior**: thermal_experiment.py (2025)  

---

## 1. ESTADO ACTUAL DEL LABORATORIO 2025

### 1.1 Archivo Principal: `thermal_experiment.py`

**Ubicación**: `e:\GIT\LabPiPanel\thermal_experiment.py` (313 líneas)

**Clase**: `ThermalExperiment`

**Responsabilidades**:
- ✅ Cálculo de configuración de potencia (V, A desde W y Ω)
- ✅ Cálculo de resistencia térmica (ΔT / P)
- ✅ Ejecución secuencial de niveles de potencia
- ✅ Grabación de datos CSV con timestamps
- ✅ Control de bomba de fluido
- ✅ Manejo de excepciones (KeyboardInterrupt, errors)

**Parámetros Experimentales** (en `config.py`):
```python
EXPERIMENT_POWER_LEVELS = [1.0, 2.0, 3.0]        # Watios
EXPERIMENT_DURATION_PER_LEVEL = 600              # Segundos (10 min)
EXPERIMENT_SAMPLE_RATE = 60                      # 1 lectura/minuto
```

**Canales DAQ Originales**:
```python
EVAPORATOR_CHANNELS = [0, 1, 2, 3]   # 4 canales
CONDENSER_CHANNELS = [4, 5, 6, 7]    # 4 canales
```

### 1.2 Variables del Experimento

| Variable | Descripción | Unidades | Rango Típico |
|----------|-------------|----------|--------------|
| **Power Level (P)** | Potencia entregada | W | 1-100 |
| **Duration** | Tiempo por nivel | s | 300-3600 |
| **Sample Rate** | Frecuencia muestreo | Hz/s | 1-100 |
| **Resistance (R)** | Carga térmica | Ω | 10-100 |
| **Voltage (V)** | Calculado: √(P×R) | V | 0-300 |
| **Current (I)** | Calculado: V/R | A | 0-5.2 |
| **ΔT** | T_evap - T_cond | °C | 5-80 |
| **R_thermal** | ΔT / P | °C/W | 0.01-10 |

---

## 2. PUNTOS DE ENTRADA DEL SISTEMA (2026)

### 2.1 Jerarquía de Inicio

```
┌─────────────────────────────────────────────┐
│  RASPBERRY PI ENCENDIDA                     │
│  (Systemd Service - Auto-init)              │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │ apps/backend/app.py │  ◄── PUNTO DE ENTRADA PRINCIPAL
        │  (Flask Server)     │
        │  Puerto 5000        │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────────┐
        │ data_acquisition_loop()          │
        │ (Thread permanente - 10Hz)      │
        │ • Lee DAQ USB5203               │
        │ • Lee Fuente XLN (Telnet)       │
        │ • Calcula promedios de zonas    │
        │ • Envía SSE /api/live-data      │
        └─────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │ Frontend Web (Vite - React)     │
        │  Puerto 5173 (desarrollo)       │
        │  - Tiempo real (SSE)            │
        │  - Control de relés             │
        │  - Configuración dinámica       │
        └─────────────────────────────────┘
```

### 2.2 Archivo Principal

**Archivo**: `apps/backend/app.py` (636 líneas)

**Punto de Entrada**: Líneas finales del archivo
```python
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    )
```

**Thread de Datos**: `data_acquisition_loop()`
- **Frecuencia**: 10 Hz (100 ms)
- **Duración**: Permanente (mientras app corre)
- **Datos**: Temperaturas, voltaje, corriente, potencia, estado relés

### 2.3 Cómo Inicia en Raspberry Pi

**Opción 1: Systemd Service** (Recomendado)
```
[Unit]
Description=LabPiPanel Thermal Lab

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/LabPiPanel/apps/backend
ExecStart=/usr/bin/python3 /home/pi/LabPiPanel/apps/backend/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Opción 2: Crontab**
```bash
@reboot cd /home/pi/LabPiPanel && python apps/backend/app.py
```

**Opción 3: Startup Script**
```bash
/etc/init.d/labpipanel start
```

---

## 3. CONTROL DEL DISPLAY OLED

### 3.1 Estado Actual

**Búsqueda**: No existe archivo `oled_driver.py` o similar en la estructura actual.

**Referencias OLED en codebase**:
- ❌ No hay imports de `Adafruit_SSD1306` o similares
- ❌ No hay direcciones I2C (0x3C, 0x3D)
- ❌ No hay código de escritura a OLED

### 3.2 Especificaciones del Hardware OLED

**Pantalla**: SSD1306 128×64 pixels
- **Protocolo**: I2C
- **Dirección**: 0x3C o 0x3D (jumper configurable)
- **Voltaje**: 3.3V (Raspberry Pi compatible)
- **Pines**:
  - GND → GND (Pin 6)
  - VCC → 3.3V (Pin 1)
  - SCL → GPIO 3 / i2c1_SCL (Pin 5)
  - SDA → GPIO 2 / i2c1_SDA (Pin 3)

### 3.3 Requisito Pendiente

Para el laboratorio completo, se necesita crear:

```
apps/backend/hardware/oled_driver.py
```

Con funcionalidades:
- Inicialización I2C
- Escritura de mensajes en tiempo real
- Display de estado del sistema
- Alertas visuales

---

## 4. INTEGRACIÓN PROPUESTA (Experimento Térmico Automatizado)

### 4.1 Nueva Estructura de Archivos

```
apps/backend/
├── app.py                          (Existente - Ampliación)
├── experiments/                    (NUEVA CARPETA)
│   ├── __init__.py
│   ├── thermal_experiment_v2.py   (NUEVO)
│   ├── experiment_config.py        (NUEVO)
│   └── experiment_manager.py       (NUEVO)
├── hardware/
│   ├── daq_reader.py
│   ├── fuente_xln.py
│   ├── gpio_controller.py
│   └── oled_driver.py              (NUEVO - PENDIENTE)
├── models/
│   ├── data_models.py              (Existente + Ampliación)
│   └── experiment_models.py        (NUEVO)
└── ...
```

### 4.2 Modelos de Datos (Nuevos/Ampliados)

**Archivo**: `apps/backend/models/experiment_models.py`

```python
@dataclass
class ExperimentLevel:
    """Configuración de un nivel de potencia"""
    power_w: float                    # Potencia en W
    duration_sec: float               # Duración en segundos
    sample_rate_hz: float             # Frecuencia muestreo en Hz
    resistance_ohm: float             # Resistencia de carga

@dataclass
class ExperimentConfig:
    """Configuración de experimento completo"""
    name: str                         # Nombre del experimento
    description: str
    levels: List[ExperimentLevel]     # Secuencia de niveles
    enable_pump: bool = True          # Activar bomba
    auto_save_csv: bool = True        # Grabar en CSV
    target_daq_channels: Dict[str, List[int]] = field(
        default_factory=lambda: {
            "evaporador": [0, 1, 2],
            "condensador": [4, 5, 6],
            "compresor": [3],
            "ambiente": [7]
        }
    )

@dataclass
class ExperimentResult:
    """Resultado de un nivel completado"""
    level_index: int
    power_w: float
    voltage_v: float
    current_a: float
    t_evap_avg_c: float
    t_cond_avg_c: float
    r_thermal_c_per_w: float
    samples_collected: int
    duration_actual_sec: float
    timestamp: str
    csv_path: Optional[str] = None
```

### 4.3 API REST Nuevas

**Endpoints para Experimentos**:

```python
# GET /api/experiments
# Lista experimentos predefinidos

# POST /api/experiments
# Crea nuevo experimento personalizado

# POST /api/experiments/{exp_id}/run
# Inicia experimento
# Body: {
#   "enable_pump": bool,
#   "target_daq_channels": {...}
# }

# GET /api/experiments/status
# Estado actual del experimento en ejecución

# POST /api/experiments/stop
# Detiene experimento actual

# GET /api/experiments/{exp_id}/results
# Obtiene resultados

# GET /api/experiments/{exp_id}/results/csv
# Descarga CSV del experimento
```

### 4.4 WebSocket / SSE Ampliado

**Evento SSE existente**: `/api/live-data` (cada 100ms)

**Añadir campos**:
```json
{
  "timestamp": "2026-02-04T14:30:45.123Z",
  "temperature": {...},
  "voltage": 250.0,
  "current": 2.5,
  "power": 625.0,
  "r_thermal": 0.125,
  
  "experiment": {
    "running": true,
    "level_index": 1,
    "level_name": "25W",
    "time_remaining_sec": 340,
    "samples_collected": 40,
    "progress_percent": 43.3
  }
}
```

---

## 5. VARIABLES DE CONFIGURACIÓN ACTUAL

### 5.1 En `config.py` (Raíz)

```python
# EXPERIMENTOS
EXPERIMENT_POWER_LEVELS = [1.0, 2.0, 3.0]          # W
EXPERIMENT_DURATION_PER_LEVEL = 600                # s (10 min)
EXPERIMENT_SAMPLE_RATE = 60                        # s (1 muestra/min)

# CANALES (Obsoleto - reemplazado por channel_groups)
EVAPORATOR_CHANNELS = [0, 1, 2, 3]
CONDENSER_CHANNELS = [4, 5, 6, 7]

# DAQ
DAQ_CHANNELS = 8
DAQ_THERMOCOUPLE_TYPE = "K"

# RELÉS (GPIO)
RELAY_PINS = {
    "RELAY_1": 26,  # Bomba
    "RELAY_2": 20,
    "RELAY_3": 21,
    "RELAY_4": 16
}

# FUENTE
XLN_HOST = "192.168.1.100"
XLN_PORT = 5024
XLN_VOLTAGE_MAX = 300.0
XLN_CURRENT_MAX = 5.2
```

### 5.2 En `data_models.py` (Nueva Configuración)

```python
@dataclass
class DAQConfig:
    channel_names: List[str] = field(default_factory=lambda: [
        "T_Evap_In", "T_Evap_Mid", "T_Evap_Out", "T_Comp",
        "T_Cond_In", "T_Cond_Mid", "T_Cond_Out", "T_Ambient"
    ])
    channel_groups: Dict[str, List[int]] = field(default_factory=lambda: {
        "evaporador": [0, 1, 2],
        "condensador": [4, 5, 6],
        "compresor": [3],
        "ambiente": [7]
    })
```

### 5.3 Nuevo Sistema Propuesto

**Archivo**: `apps/backend/experiments/experiment_config.py`

```python
# Configuraciones predefinidas
STANDARD_EXPERIMENTS = {
    "quick_test": ExperimentConfig(
        name="Quick Test (5 min)",
        levels=[
            ExperimentLevel(power_w=10, duration_sec=300, sample_rate_hz=1, resistance_ohm=50),
        ]
    ),
    "full_characterization": ExperimentConfig(
        name="Caracterización Completa (90 min)",
        levels=[
            ExperimentLevel(power_w=10, duration_sec=600, sample_rate_hz=1, resistance_ohm=50),
            ExperimentLevel(power_w=25, duration_sec=600, sample_rate_hz=1, resistance_ohm=50),
            ExperimentLevel(power_w=50, duration_sec=600, sample_rate_hz=1, resistance_ohm=50),
            ExperimentLevel(power_w=75, duration_sec=600, sample_rate_hz=1, resistance_ohm=50),
        ]
    ),
    "thermal_cycling": ExperimentConfig(
        name="Thermal Cycling (120 min)",
        levels=[
            ExperimentLevel(power_w=50, duration_sec=600, sample_rate_hz=2, resistance_ohm=50),
            ExperimentLevel(power_w=0, duration_sec=300, sample_rate_hz=2, resistance_ohm=50),  # Enfriamiento
        ] * 6  # Repetir 6 veces
    )
}
```

---

## 6. VERIFICACIÓN DE INTEGRIDAD

### 6.1 Checklist de Archivos

| Archivo | Estado | Función |
|---------|--------|---------|
| `apps/backend/app.py` | ✅ OK | Punto entrada principal |
| `apps/backend/hardware/daq_reader.py` | ✅ OK | Lectura DAQ simulada |
| `apps/backend/hardware/fuente_xln.py` | ✅ OK | Control Fuente XLN |
| `apps/backend/hardware/gpio_controller.py` | ✅ OK | Control relés GPIO |
| `apps/backend/hardware/oled_driver.py` | ❌ MISSING | Display I2C |
| `apps/backend/models/data_models.py` | ✅ OK | Modelos base |
| `apps/backend/models/experiment_models.py` | ❌ MISSING | Modelos experiment |
| `apps/backend/experiments/thermal_experiment_v2.py` | ❌ MISSING | Motor de experimentos |
| `apps/backend/experiments/experiment_manager.py` | ❌ MISSING | Gestor de experimentos |
| `apps/backend/recording/recording_manager.py` | ✅ OK | Grabación CSV |
| `apps/frontend/src/components/ExperimentPanel.tsx` | ❌ MISSING | UI experimentos |

### 6.2 Status de Servicios

```
Servicio              Estado      Puerto    Auto-start
─────────────────────────────────────────────────────
Backend Flask         ✅ OK       5000      Requiere config
Frontend Vite         ✅ OK       5173      Dev mode
DAQ USB5203           📋 Simulado -         Listo para real
Fuente XLN            📋 Simulado 5024      Listo para real
GPIO Relés            📋 Simulado -         Listo para real
OLED I2C             ❌ MISSING  0x3C/3D   Requiere driver
```

---

## 7. PLAN DE ACCIÓN INMEDIATO

### Fase 1: Crear Modelos Experimentales (30 min)
- [ ] Crear `apps/backend/models/experiment_models.py`
- [ ] Definir `ExperimentLevel`, `ExperimentConfig`, `ExperimentResult`
- [ ] Ampliaciones en `SystemConfig`

### Fase 2: Motor de Experimentos (1h)
- [ ] Crear `apps/backend/experiments/thermal_experiment_v2.py`
- [ ] Migrar lógica desde `thermal_experiment.py` raíz
- [ ] Integrar con `data_acquisition_loop()`
- [ ] Implementar validaciones (límites V/A/P)

### Fase 3: Manager de Experimentos (45 min)
- [ ] Crear `apps/backend/experiments/experiment_manager.py`
- [ ] Control de estado (running, stopped, paused)
- [ ] Cola de experimentos
- [ ] Integración con grabación

### Fase 4: API REST (45 min)
- [ ] Endpoints `/api/experiments/*`
- [ ] Integración con SSE para estado en vivo
- [ ] Descarga de resultados

### Fase 5: UI Frontend (1h)
- [ ] Componente `ExperimentPanel.tsx`
- [ ] Selector de configuraciones predefinidas
- [ ] Monitor en tiempo real
- [ ] Gráficos de resultados

### Fase 6: Driver OLED (Opcional) (1.5h)
- [ ] Crear `apps/backend/hardware/oled_driver.py`
- [ ] Inicialización I2C
- [ ] Display de estado
- [ ] Manejo de alertas

---

## 8. RESUMEN EJECUTIVO

✅ **Sistema base funcional**: Backend (Flask) + Frontend (React) + SSE tiempo real  
✅ **Datos adquiridos**: 8 canales DAQ, voltaje/corriente fuente, estado relés  
✅ **Configuración flexible**: Nombres de canales, asignación de zonas editables  
✅ **Grabación**: CSV con timestamps  

❌ **Falta**: Secuenciador de experimentos térmicos automatizados  
❌ **Falta**: Display OLED I2C  
❌ **Falta**: Presets predefinidos  

🎯 **Próximo paso**: Implementar `ThermalExperimentV2` con API REST completa

---

## Contacto & Documentación

**Repo**: `mutatronik-qa/LabPiPanel` (GitHub)  
**Rama**: `main`  
**PR Activo**: #1 (feat: Add comprehensive project documentation)
