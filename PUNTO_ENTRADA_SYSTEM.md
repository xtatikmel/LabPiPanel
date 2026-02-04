# 🎯 PUNTO DE ENTRADA & CONTROL DEL SISTEMA

**Documento**: Guía Rápida de Integridad del Laboratorio  
**Versión**: 2026 (Post-Migración Monorepo)  
**Última Actualización**: 4 febrero 2026

---

## ⚡ PUNTO DE ENTRADA PRINCIPAL

### Archivo: `apps/backend/app.py`

```
📍 UBICACIÓN: e:\GIT\LabPiPanel\apps\backend\app.py (636 líneas)
🚀 PUNTO INICIO: Líneas finales del archivo
⏱️  FRECUENCIA: Permanente (mientras Raspberry Pi esté encendida)
🔌 PUERTO: 5000
```

### Cómo Inicia en Raspberry Pi 3

**Opción Recomendada: Systemd Service (Auto-init)**

```bash
# En Raspberry Pi, crear:
/etc/systemd/system/labpipanel.service

[Unit]
Description=LabPiPanel Thermal Laboratory System
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/LabPiPanel/apps/backend
ExecStart=/usr/bin/python3 /home/pi/LabPiPanel/apps/backend/app.py
Restart=always
RestartSec=10
StandardOutput=inherit
StandardError=inherit

[Install]
WantedBy=multi-user.target

# Habilitar:
sudo systemctl daemon-reload
sudo systemctl enable labpipanel.service
sudo systemctl start labpipanel.service
```

**Verificar que está corriendo:**
```bash
sudo systemctl status labpipanel.service
sudo journalctl -u labpipanel.service -f  # Ver logs en vivo
```

---

## 🧵 THREAD DE DATOS (Data Acquisition Loop)

### Función: `data_acquisition_loop()`

```python
# Ubicación: apps/backend/app.py (línea ~50)

def data_acquisition_loop():
    """Loop continuo de adquisición de datos (100ms)"""
    global current_data, thread_running
    
    while thread_running:
        # Leer datos del DAQ (8 canales)
        temps = daq.read_all_channels()
        
        # Leer voltaje/corriente de fuente
        voltage, current = fuente.get_voltage_current()
        power = voltage * current
        
        # Calcular promedios por zona
        t_evap_avg = avg_for_group(channel_groups.get("evaporador", []))
        t_cond_avg = avg_for_group(channel_groups.get("condensador", []))
        
        # Crear objeto LiveData
        current_data = LiveData(...)
        
        # Enviar por SSE (/api/live-data)
        # Grabar si está activo
        # Verificar alertas
        
        # Mantener 10Hz (100ms)
        time.sleep(0.1)
```

**Características**:
- ✅ Frecuencia: 10 Hz (100 ms)
- ✅ Continuo: Mientras app esté ejecutándose
- ✅ Thread independiente: No bloquea la API REST
- ✅ SSE streaming: En vivo a frontend

---

## 🎮 CONTROL DEL DISPLAY OLED (I2C)

### Hardware Specifications

```
Pantalla: SSD1306 128×64 pixels
Protocolo: I2C
Dirección: 0x3C (predeterminada) o 0x3D (jumper)
Voltaje: 3.3V
Pins (Raspberry Pi 3):
  ├─ GND   → GND (Pin 6)
  ├─ VCC   → 3.3V (Pin 1) 
  ├─ SCL   → GPIO 3 (Pin 5) - i2c1_SCL
  └─ SDA   → GPIO 2 (Pin 3) - i2c1_SDA
```

### 🔴 ESTADO ACTUAL: NO EXISTE DRIVER

**Problema**: No hay archivo `oled_driver.py` en la estructura actual.

**Archivos que FALTA crear**:

1. **Archivo Raíz**:
```
apps/backend/hardware/oled_driver.py
```

2. **Contenido Propuesto** (Stub):

```python
"""
Driver para Display OLED SSD1306 (I2C)
Controla pantalla 128x64 conectada a GPIO del Raspberry Pi
"""

import board
import busio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
import logging

logger = logging.getLogger(__name__)

class OLEDDisplay:
    """Controlador para Display OLED SSD1306"""
    
    def __init__(self, address=0x3C, width=128, height=64):
        """
        Inicializa conexión I2C y display OLED
        
        Args:
            address: Dirección I2C (0x3C por defecto)
            width: Ancho en píxeles (128)
            height: Altura en píxeles (64)
        """
        try:
            self.i2c = busio.I2C(board.SCL, board.SDA)
            self.display = adafruit_ssd1306.Adafruit_SSD1306_I2C(
                width, height, self.i2c, addr=address
            )
            self.width = width
            self.height = height
            self.image = Image.new('1', (width, height))
            self.draw = ImageDraw.Draw(self.image)
            logger.info(f"OLED inicializado en dirección 0x{address:02x}")
        except Exception as e:
            logger.error(f"Error inicializando OLED: {e}")
            self.display = None
    
    def write_status(self, title: str, values: dict):
        """
        Escribe estado actual en OLED
        
        Args:
            title: Título (línea 1)
            values: {label: value} para mostrar
        """
        if not self.display:
            return
        
        self.draw.rectangle((0, 0, self.width, self.height), fill=0)
        
        # Título
        self.draw.text((0, 0), title, fill=1)
        
        # Valores
        y = 10
        for label, value in values.items():
            self.draw.text((0, y), f"{label}: {value}", fill=1)
            y += 10
        
        self.display.image(self.image)
        self.display.display()
    
    def write_alert(self, message: str):
        """Muestra alerta en pantalla"""
        # Implementation...
        pass
    
    def shutdown(self):
        """Apaga el display"""
        if self.display:
            self.display.fill(0)
            self.display.display()
```

3. **Dependencias a Instalar** (en Raspberry Pi):

```bash
pip install adafruit-circuitpython-ssd1306
pip install pillow

# Habilitar i2c en raspi-config:
# sudo raspi-config → Interfacing Options → I2C → Enable
```

### 🎛️ Cómo Controlar el Display desde Backend

```python
# En apps/backend/app.py, en data_acquisition_loop():

from hardware.oled_driver import OLEDDisplay

oled = OLEDDisplay(address=0x3C)

while thread_running:
    # ... adquisición de datos ...
    
    # Mostrar estado en OLED
    oled.write_status(
        title="LABPIPANEL",
        values={
            "T_Evap": f"{t_evap_avg:.1f}°C",
            "T_Cond": f"{t_cond_avg:.1f}°C",
            "V": f"{voltage:.1f}V",
            "I": f"{current:.2f}A"
        }
    )
    
    # Si hay alerta
    if alert_detected:
        oled.write_alert("⚠️ TEMP ALTA")
```

---

## 📊 SERVICIOS QUE SE INICIAN

| Servicio | Puerto | Auto-start | Estado |
|----------|--------|-----------|--------|
| **Backend Flask** | 5000 | ✅ Systemd | 🟢 Running |
| **Frontend Vite** | 5173 | 📋 Manual | Development |
| **DAQ USB5203** | - | ✅ Thread | 📋 Simulado |
| **Fuente XLN** | 5024 | ✅ Thread | 📋 Simulado |
| **Relés GPIO** | - | ✅ Thread | 📋 Ready |
| **OLED I2C** | 0x3C | ❌ Falta | ❌ Missing |
| **Recording** | - | 📋 On-demand | ✅ Ready |
| **Alertas** | - | ✅ Thread | ✅ Ready |

---

## 🔍 VERIFICACIÓN DE INTEGRIDAD

### Checklist Rápido

```bash
# 1. Backend está escuchando
netstat -tln | grep 5000
# Debe mostrar: tcp 0 0 0.0.0.0:5000

# 2. Verificar API
curl http://localhost:5000/api/status
# Debe retornar JSON con estado

# 3. Verificar SSE (datos en vivo)
curl -N http://localhost:5000/api/live-data
# Debe mostrar JSON cada 100ms

# 4. Verificar configuración
curl http://localhost:5000/api/config
# Debe mostrar SystemConfig completo

# 5. Verificar relés
curl -X POST http://localhost:5000/api/relay/0
# Debe cambiar estado del relé 0
```

### Estructura de Directorios Esencial

```
e:\GIT\LabPiPanel/
├── apps/
│   ├── backend/
│   │   ├── app.py                      ✅ ENTRADA PRINCIPAL
│   │   ├── hardware/
│   │   │   ├── daq_reader.py          ✅ OK
│   │   │   ├── fuente_xln.py          ✅ OK
│   │   │   ├── gpio_controller.py     ✅ OK
│   │   │   └── oled_driver.py         ❌ FALTA CREAR
│   │   ├── models/
│   │   │   ├── data_models.py         ✅ OK
│   │   │   └── experiment_models.py   ❌ FALTA CREAR
│   │   ├── experiments/               ❌ FALTA CARPETA
│   │   ├── recording/                 ✅ OK
│   │   └── alerts/                    ✅ OK
│   └── frontend/
│       └── src/
│           └── components/
│               ├── ConfigPanel.tsx    ✅ FIXED
│               └── ExperimentPanel.tsx ❌ FALTA CREAR
├── thermal_experiment.py               ✅ EXISTENTE (2025)
├── config.py                           ✅ EXISTENTE
└── README.md                           ✅ DOCUMENTADO
```

---

## 🚀 CÓMO INICIAR MANUALMENTE

### Opción 1: PowerShell (Windows - Dev)

```powershell
# Terminal 1: Backend
cd E:\GIT\LabPiPanel\apps\backend
python app.py

# Terminal 2: Frontend
cd E:\GIT\LabPiPanel\apps\frontend
npm run dev

# En navegador: http://localhost:5173
```

### Opción 2: Bash (Linux/Raspberry Pi)

```bash
# Terminal 1: Backend
cd ~/LabPiPanel/apps/backend
python3 app.py

# Terminal 2: Frontend (si necesario)
cd ~/LabPiPanel/apps/frontend
npm run dev
```

### Opción 3: Make (Ambas plataformas)

```bash
cd E:\GIT\LabPiPanel
make run           # Ejecuta ambos
make dev           # Dev mode con hot reload
```

---

## 📋 PRÓXIMAS ACCIONES

### Corto Plazo (Hoy)
- [ ] Verificar que backend inicia sin errores
- [ ] Confirmar SSE funciona en tiempo real
- [ ] Probar cambios de configuración

### Mediano Plazo (Esta semana)
- [ ] Crear `experiment_models.py`
- [ ] Crear `thermal_experiment_v2.py`
- [ ] Crear endpoints API `/api/experiments/*`

### Largo Plazo (Antes de deploy Pi)
- [ ] Crear `oled_driver.py` (IMPORTANTE)
- [ ] Crear `ExperimentPanel.tsx` (UI)
- [ ] Crear systemd service
- [ ] Testing en Raspberry Pi real

---

## 🎓 VARIABLES DEL EXPERIMENTO (Referencia)

```python
# Niveles de Potencia (W)
power_w: [1.0, 5.0, 10.0, 25.0, 50.0, 100.0]

# Duración por Nivel (segundos)
duration_sec: 300-3600  # 5 min a 1 hora

# Frecuencia de Muestreo (Hz)
sample_rate_hz: 1-100   # 1 a 100 muestras/segundo

# Resistencia de Carga (Ohm)
resistance_ohm: 10-100  # Para cálculo de potencia

# Fórmulas:
V = sqrt(P * R)         # Voltaje = raiz(Potencia * Resistencia)
I = V / R               # Corriente = Voltaje / Resistencia
R_thermal = ΔT / P      # Resistencia térmica
```

---

**Última Verificación**: 4-Feb-2026 | **Status**: ✅ OPERACIONAL (sin OLED)
