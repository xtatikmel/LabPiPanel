# PLAN DE ACCIÓN - KIMI INTEGRADO EN /IA/APP

**Estado Actual:** 4 de febrero de 2026  
**Situación:** Ya tienes el código de Kimi en `/IA/app` con frontend + backend integrados

---

## 🎯 DIAGNÓSTICO ACTUAL

### ¿Qué tienes?

```
e:\GIT\LabPiPanel\
├── IA/
│   ├── app/                    ← KIMI (Frontend + Backend JUNTOS)
│   │   ├── src/                ← React + TypeScript
│   │   │   ├── components/     ← 13 componentes profesionales
│   │   │   ├── hooks/          ← useLiveData integrado
│   │   │   └── App.tsx         ← App mejorada
│   │   ├── backend/            ← Flask Python SEPARADO
│   │   │   ├── app.py          ← Servidor Flask
│   │   │   ├── hardware/       ← Drivers (DAQ, Fuente, GPIO)
│   │   │   └── models/         ← Modelos de datos
│   │   ├── package.json        ← Dependencias React
│   │   ├── vite.config.ts      ← Config build
│   │   └── start_server.py     ← Script para iniciar todo
│   │
│   └── project/                ← BOLT (original, mantener como referencia)
│
└── labpipanel.py               ← Servidor ANTIGUO (puede retirarse)
```

### ¿Cuál es la diferencia?

| Aspecto | `project/` (Bolt) | `app/` (Kimi) |
|---------|-----------------|--------------|
| Componentes | 7 básicos | 13 profesionales |
| UI Framework | TailwindCSS | **Shadcn/ui** (mejor) |
| Charts | Canvas manual | Chart.js + Recharts (profesional) |
| Backend | Falta integrar | **Ya integrado** ✅ |
| SSE/WebSocket | No tiene | **SSE integrado** ✅ |
| Alertas | Básicas | **Profesionales con historial** ✅ |
| Configuración | Manual | **Panel dinámico** ✅ |
| Estado: Listo | ❌ No | **✅ SÍ, COMPLETAMENTE** |

---

## 📋 PRÓXIMOS PASOS (POR HACER)

### FASE 1: VALIDAR Y TESTEAR LOCALMENTE (2-3 horas)

**Paso 1: Verificar dependencias**

```bash
cd e:\GIT\LabPiPanel\IA\app

# Instalar dependencias Node
npm install

# Instalar dependencias Python backend
cd backend
pip install -r requirements.txt
cd ..
```

**Paso 2: Iniciar servidor**

```bash
# Terminal 1: Backend (Python)
cd e:\GIT\LabPiPanel\IA\app
python start_server.py

# Terminal 2: Frontend (Node)
cd e:\GIT\LabPiPanel\IA\app
npm run dev

# Resultado esperado:
# - Backend: http://localhost:5000
# - Frontend: http://localhost:5173
```

**Paso 3: Validar conexión**

- Abre http://localhost:5173 en navegador
- Debe mostrar:
  - ✅ Header con "Connected" (verde)
  - ✅ FuenteControl (3 sliders)
  - ✅ RelayControl (4 botones)
  - ✅ TemperatureChart (gráfica)
  - ✅ No debe haber errores en consola

**Paso 4: Probar API endpoints**

```bash
# En PowerShell
curl http://localhost:5000/api/status

# Debe devolver:
# {
#   "timestamp": "2026-02-04T...",
#   "voltage": 0,
#   "current": 0,
#   ...
# }
```

---

### FASE 2: CONECTAR HARDWARE REAL (3-4 horas)

Este es el paso más crítico. El backend de Kimi está **simulado**, necesita conectar a hardware real.

**Paso 1: Revisar hardware disponible**

Verifica qué hardware necesitas conectar:

```
✓ Fuente XLN30052 (Telnet, IP + Puerto)
✓ DAQ USB5203 (USB, drivers MCC)
✓ Relés GPIO (BCM pins: 17, 27, 22, 10)
```

**Paso 2: Copiar drivers reales**

Los drivers ya existen en la raíz del proyecto:

```bash
# Copiar drivers de fuente_xln
Copy-Item -Path e:\GIT\LabPiPanel\fuente_xln.py -Destination e:\GIT\LabPiPanel\IA\app\backend\hardware\

# Copiar drivers de DAQ
Copy-Item -Path e:\GIT\LabPiPanel\daq_usb5203.py -Destination e:\GIT\LabPiPanel\IA\app\backend\hardware\

# Copiar drivers de relés
Copy-Item -Path e:\GIT\LabPiPanel\relay_controller.py -Destination e:\GIT\LabPiPanel\IA\app\backend\hardware\
```

**Paso 3: Actualizar importes en backend**

En `e:\GIT\LabPiPanel\IA\app\backend\hardware\`:

- `fuente_xln.py`: Asegurar que se importa en `app.py`
- `daq_usb5203.py`: Asegurar que se importa en `app.py`
- `gpio_controller.py`: Integrar con `relay_controller.py`

**Paso 4: Validar configuración de hardware**

```python
# En backend/app.py, verificar:

# Fuente XLN
XLN_HOST = '192.168.1.100'  # Tu IP de fuente
XLN_PORT = 5024             # Puerto Telnet

# DAQ USB5203
DAQ_DEVICE_ID = 0           # Identificador USB

# GPIO Relés
RELAY_PINS = [17, 27, 22, 10]  # Pines BCM
```

**Paso 5: Testear conexión con hardware**

```bash
# Terminal: Backend
cd e:\GIT\LabPiPanel\IA\app
python start_server.py

# Ver logs:
# "Fuente XLN conectada"
# "DAQ USB5203 detectado"
# "GPIO relés inicializados"
```

---

### FASE 3: DESPLEGAR A RASPBERRY PI (4-6 horas)

Una vez que todo funciona localmente.

**Opción A: Docker (Recomendado)**

```bash
# En tu PC, crear imagen Docker
cd e:\GIT\LabPiPanel\IA\app

# Crear Dockerfile multi-stage si no existe
# (especificar ARM64 para RPi)

docker build -t labpipanel:latest .
docker run -p 5000:5000 -p 5173:5173 labpipanel:latest
```

**Opción B: Instalación nativa en RPi**

```bash
# En Raspberry Pi

# 1. Clonar o copiar proyecto
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel/IA/app

# 2. Instalar dependencias
pip install -r backend/requirements.txt
npm install

# 3. Crear servicio systemd
sudo cp systemd/labpipanel.service /etc/systemd/system/
sudo systemctl enable labpipanel
sudo systemctl start labpipanel

# 4. Ver status
sudo systemctl status labpipanel
```

**Validación en RPi:**

```bash
# En RPi, acceder a:
http://localhost:5173

# O desde otra PC en la red:
http://[RPi-IP]:5173
```

---

### FASE 4: VALIDAR CON HARDWARE EN LABORATORIO (4-6 horas)

**Checklist de validación:**

```
Hardware:
☐ Fuente XLN conectada y responde
☐ DAQ USB5203 detecta termopares
☐ 4 relés controlan cargas

Frontend:
☐ Gráficas de temperatura actualizan en tiempo real
☐ Control de voltaje/corriente funciona
☐ Relés se encienden/apagan
☐ Grabación CSV genera archivo

Backend:
☐ APIs responden con datos reales
☐ SSE (Server-Sent Events) envía datos continuos
☐ Logs muestran operaciones
☐ Alertas funcionan cuando excede límites
```

---

## 🛠️ HERRAMIENTAS Y REFERENCIAS

### Comandos clave

```bash
# Instalar dependencias
npm install                    # Frontend
pip install -r requirements.txt # Backend

# Desarrollo local
npm run dev                   # Inicia Vite en :5173
python start_server.py        # Inicia Flask en :5000

# Build para producción
npm run build                 # Compila TypeScript + React

# Testing
npm run lint                  # ESLint validation
```

### Configuración de URLs

**En desarrollo (localhost):**
```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000/api
```

**En Raspberry Pi:**
```
Frontend:  http://RPi-IP:5173
Backend:   http://RPi-IP:5000/api
```

**En producción (con Nginx):**
```
Frontend:  http://tu-dominio.com
Backend:   http://tu-dominio.com/api
```

---

## 📊 ESTRUCTURAS DE DATOS

### LiveData (lo que recibe el frontend)

```typescript
{
  timestamp: "2026-02-04T14:30:45.123Z",
  elapsed_time: 3045.123,
  voltage: 120.5,
  current: 2.3,
  power: 276.95,
  temperatures: [25.3, 26.1, 25.8, 42.3, 40.1, 39.8, 25.2, 26.0],
  t_evap_avg: 25.73,      // Promedio canales 0,1,2
  t_cond_avg: 40.0,       // Promedio canales 4,5,6
  r_thermal: 0.62,        // ΔT / Power
  relays: [false, true, false, false],
  recording: true,
  fuente_connected: true,
  daq_connected: true
}
```

### API Endpoints disponibles

```
GET  /api/status              → LiveData actual
GET  /api/system/config       → Configuración del sistema
POST /api/fuente/voltage      → Fijar voltaje
POST /api/fuente/current      → Fijar corriente
POST /api/fuente/output       → Encender/apagar
POST /api/relay/toggle        → Togglear relé
GET  /api/recording/start     → Iniciar grabación
GET  /api/recording/stop      → Detener grabación
GET  /api/alerts/list         → Lista de alertas
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### "Connection refused en :5000"

```bash
# Verificar que Flask está corriendo
curl http://localhost:5000/api/status

# Si no responde:
cd IA\app
python backend\app.py  # Inicia directamente

# Ver logs para errores de hardware
```

### "frontend no actualiza datos"

```bash
# Verificar que SSE está activo
# En navegador DevTools → Network
# Buscar request a /api/status/stream

# Si no aparece:
# - Backend no está enviando SSE
# - CORS mal configurado
```

### "DAQ no detecta termopares"

```bash
# Verificar driver MCC
python -c "from mcculw import ul; print(ul.get_info())"

# Instalar driver si falta
pip install mcculw

# En Windows: descargar InstaCal desde MCC website
```

### "No puedo cambiar GPIO en RPi"

```bash
# Verificar permisos GPIO
ls -l /dev/gpiomem

# Si da error de permisos:
sudo usermod -aG gpio $USER
# Luego logout/login
```

---

## 📈 TIMELINE ESTIMADO

| Fase | Tarea | Horas | Deadline |
|------|-------|-------|----------|
| 1 | Validar localmente | 2-3 | Hoy |
| 2 | Conectar hardware | 3-4 | Mañana |
| 3 | Desplegar a RPi | 4-6 | 2-3 días |
| 4 | Validar en laboratorio | 4-6 | 4-5 días |
| **TOTAL** | | **13-19h** | **~1 semana** |

---

## ✅ VERIFICACIÓN FINAL

Cuando todo esté listo, deberías tener:

```
✅ Frontend React en :5173 mostrando datos en tiempo real
✅ Backend Flask en :5000 controlando hardware
✅ 8 termopares actualizando cada 100ms
✅ Voltaje/Corriente controlables desde interfaz
✅ 4 relés encendibles desde interfaz
✅ Grabación CSV registrando datos
✅ Alertas disparándose cuando excede límites
✅ Sistema corriendo en Raspberry Pi
✅ Datos persistentes entre sesiones
```

---

## 🚀 PRÓXIMO PASO

**¿Cuál es tu siguiente acción?**

Opción A: **Testear localmente** → Ejecutar FASE 1  
Opción B: **Ver estado del hardware** → ¿Qué hardware tienes conectado?  
Opción C: **Desplegar directamente a RPi** → Necesitarás RPi accesible  
Opción D: **Entender arquitectura** → Explicar qué componentes hacen qué  

**Avísame cuál prefieres y te doy instrucciones paso a paso.**

---

**Documentación v1.0 - 4 de febrero de 2026**
