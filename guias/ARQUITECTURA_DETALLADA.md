# ARQUITECTURA DETALLADA - LABPIPANEL KIMI

**Documento:** Explicación completa de la arquitectura del sistema  
**Fecha:** 4 de febrero de 2026  
**Versión:** 1.0

---

## 📐 VISIÓN GENERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LABORATORIO TÉRMICO ITM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CAPA PRESENTACIÓN (React + TypeScript + Shadcn/ui + Chart.js)             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  UI Components:                                                     │   │
│  │  • Header (Estado de conexión)                                      │   │
│  │  • FuenteControl (Voltaje/Corriente/Output)                         │   │
│  │  • RelayControl (4 botones relés)                                   │   │
│  │  • TemperaturePanel (8 canales + promedios)                         │   │
│  │  • 4 Gráficas en tiempo real                                        │   │
│  │  • ConfigPanel (Configuración dinámica)                             │   │
│  │  • AlertsPanel (Sistema de alertas)                                 │   │
│  │  • RecordingControl (CSV export)                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↕ HTTP SSE                                      │
│  CAPA LÓGICA (TypeScript Hooks)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Hooks Personalizados:                                              │   │
│  │  • useLiveData        → SSE EventSource para datos en tiempo real   │   │
│  │  • useFuente          → Control de fuente XLN                       │   │
│  │  • useSystemStatus    → Estado del sistema                          │   │
│  │  • useLiveDataPolling → Fallback con polling (100ms)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            ↕ REST API JSON                                   │
│  CAPA APLICACIÓN (Flask + Python)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Backend (puerto 5000):                                             │   │
│  │  • API REST endpoints (/api/*)                                      │   │
│  │  • SSE streaming (/api/live-data)                                   │   │
│  │  • Data acquisition loop (100ms)                                    │   │
│  │  • Alert checking & management                                      │   │
│  │  • Recording manager (CSV)                                          │   │
│  │  • Configuration manager                                            │   │
│  │                                                                     │   │
│  │  Data Models:                                                       │   │
│  │  • LiveData (timestamp, V, I, 8 temps, relays, etc.)               │   │
│  │  • SystemStatus (conectivity, recording, elapsed time)              │   │
│  │  • AlertConfig (limits, thresholds)                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            ↕ Hardware Protocol                               │
│  CAPA HARDWARE (Python Drivers)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  daq_reader.py                                                      │   │
│  │  ├─ DAQReader class                                                 │   │
│  │  ├─ read_all_channels() → float[8]  (0-100°C)                       │   │
│  │  └─ Usa: mcculw para USB5203                                        │   │
│  │                                                                     │   │
│  │  fuente_xln.py                                                      │   │
│  │  ├─ FuenteXLN class                                                 │   │
│  │  ├─ get_voltage_current() → (V, I)                                 │   │
│  │  ├─ set_voltage(0-300V) / set_current(0-5.2A)                      │   │
│  │  ├─ turn_on() / turn_off()                                         │   │
│  │  └─ Usa: telnetlib para puerto 5024                                 │   │
│  │                                                                     │   │
│  │  gpio_controller.py                                                 │   │
│  │  ├─ GPIOController class                                            │   │
│  │  ├─ toggle_relay(id) / set_relay(id, state)                        │   │
│  │  ├─ get_all_states() → bool[4]                                     │   │
│  │  └─ Usa: RPi.GPIO para pines BCM [17, 27, 22, 10]                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            ↕ Device Protocols                                │
│  HARDWARE FÍSICO                                                            │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┐    │
│  │   BK Precision XLN   │  DAQ USB-5203        │  Relés GPIO          │    │
│  │   Telnet 5024        │  USB + 8 canales     │  4 relés (BCM pins)  │    │
│  │   300V / 5.2A        │  Termopares          │  220V AC control     │    │
│  └──────────────────────┴──────────────────────┴──────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS EN TIEMPO REAL

### 1. LECTURA DE DATOS (100ms cada vez)

```
┌──────────────────────────────────────────────────────────────────┐
│ Backend: data_acquisition_loop() ejecutándose cada 100ms         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 1. Leer DAQ:         daq.read_all_channels()       │
     │    Resultado: [T0, T1, T2, T3, T4, T5, T6, T7]     │
     │    Rango: 0-100°C cada canal                       │
     │    Tiempo: ~50ms                                    │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 2. Leer Fuente:      fuente.get_voltage_current()  │
     │    Resultado: (V, I)                               │
     │    Rango V: 0-300V                                 │
     │    Rango I: 0-5.2A                                 │
     │    Tiempo: ~30ms (Telnet 5024)                     │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 3. Leer Relés:       gpio.get_all_states()         │
     │    Resultado: [bool, bool, bool, bool]             │
     │    Tiempo: <1ms                                     │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 4. CALCULAR:                                        │
     │    • Power = V × I                                  │
     │    • T_Evap_Avg = (T0+T1+T2)/3 (evaporador)        │
     │    • T_Cond_Avg = (T4+T5+T6)/3 (condensador)       │
     │    • R_Thermal = ΔT / Power (resistencia térmica)  │
     │    Tiempo: <1ms                                     │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 5. CREAR LiveData object:                           │
     │    {                                                │
     │      timestamp: "2026-02-04T14:30:45.123Z",        │
     │      elapsed_time: 3045.123,                        │
     │      voltage: 120.5,                                │
     │      current: 2.3,                                  │
     │      power: 276.95,                                 │
     │      temperatures: [25.3, 26.1, 25.8, ...],        │
     │      t_evap_avg: 25.73,                             │
     │      t_cond_avg: 40.0,                              │
     │      r_thermal: 0.62,                               │
     │      relays: [true, false, true, false],           │
     │      recording: true,                               │
     │      fuente_connected: true,                        │
     │      daq_connected: true                            │
     │    }                                                │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 6. VERIFICAR ALERTAS:                               │
     │    alert_manager.check_data(current_data)          │
     │    → Revisa si excede límites configurados         │
     │    → Crea alertas si necesario                      │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 7. GRABAR si está habilitado:                       │
     │    if recording:                                    │
     │      recorder.write_data(current_data)             │
     │      → Agrega fila a CSV                           │
     └─────────────────────────────────────────────────────┘
                            ↓
     ┌─────────────────────────────────────────────────────┐
     │ 8. MANTENER SINCRONIZACIÓN:                         │
     │    sleep(max(0, 100ms - tiempo_procesamiento))     │
     │    → Asegura que loop sea exactamente 10Hz         │
     └─────────────────────────────────────────────────────┘
```

---

### 2. ENVÍO A FRONTEND (SSE - Server-Sent Events)

```
Backend (Python Flask):
┌────────────────────────────────────────────────────────┐
│ @app.route('/api/live-data')                           │
│ def live_data_stream():                                │
│     def event_generator():                             │
│         while True:                                    │
│             with data_lock:                            │
│                 data_json = json.dumps(asdict(...))   │
│             yield f"data: {data_json}\n\n"            │
│             time.sleep(0.1)  # 10Hz                    │
│     return Response(event_generator(), ...)            │
└────────────────────────────────────────────────────────┘
                    ↓ HTTP Connection (Keep-Alive)
                    Respuesta SSE (Server-Sent Events)
                    ↓
Frontend (React TypeScript):
┌────────────────────────────────────────────────────────┐
│ Hook: useLiveData()                                    │
│                                                        │
│ const eventSource = new EventSource(                   │
│   'http://localhost:5000/api/live-data'              │
│ );                                                     │
│                                                        │
│ eventSource.onmessage = (event) => {                   │
│   const data = JSON.parse(event.data);  ← LiveData    │
│   setData(data);                        ← Update state│
│ };                                                     │
└────────────────────────────────────────────────────────┘
                    ↓ React State Update
            Triggers re-render de componentes
                    ↓
          Charts, panels, status actualizan
```

---

## 🏗️ ESTRUCTURA DE DIRECTORIOS

```
e:\GIT\LabPiPanel\IA\app\
│
├── src/                              ← FRONTEND (React + TypeScript)
│   ├── components/                   ← 13 Componentes React
│   │   ├── Header.tsx               → Estado general del sistema
│   │   ├── FuenteControl.tsx        → Voltaje/Corriente/Output
│   │   ├── RelayControl.tsx         → 4 botones de relés
│   │   ├── TemperaturePanel.tsx     → Display de 8 temperaturas
│   │   ├── TemperatureChart.tsx     → Gráfica de temperaturas
│   │   ├── VoltageCurrentChart.tsx  → Gráfica V-I
│   │   ├── PowerChart.tsx           → Gráfica Potencia
│   │   ├── ThermalResistanceChart.tsx → Gráfica R_thermal
│   │   ├── ConfigPanel.tsx          → Configuración del sistema
│   │   ├── AlertsPanel.tsx          → Sistema de alertas
│   │   ├── RecordingControl.tsx     → Control grabación CSV
│   │   ├── StatusBar.tsx            → Barra de estado
│   │   └── ui/                      → Componentes Shadcn
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── [más componentes...]
│   │
│   ├── hooks/                        ← Custom Hooks
│   │   ├── useLiveData.ts           → SSE para datos en tiempo real
│   │   ├── useFuente.ts             → Control de fuente
│   │   ├── useSystemStatus.ts       → Estado del sistema
│   │   └── useLiveDataPolling.ts    → Fallback polling
│   │
│   ├── types/                        ← TypeScript Interfaces
│   │   └── index.ts                 → LiveData, SystemStatus, etc.
│   │
│   ├── lib/                          ← Utilidades
│   │   └── utils.ts                 → Funciones auxiliares
│   │
│   ├── App.tsx                       → Componente principal
│   ├── main.tsx                      → Entry point
│   └── index.css                     → Estilos globales
│
├── backend/                          ← BACKEND (Flask + Python)
│   ├── app.py                        → Servidor Flask (609 líneas)
│   │                                   - REST endpoints
│   │                                   - SSE streaming
│   │                                   - Data acquisition loop
│   │
│   ├── models/
│   │   └── data_models.py           → Dataclasses
│   │       ├── LiveData
│   │       ├── SystemStatus
│   │       ├── SystemConfig
│   │       └── AlertConfig
│   │
│   ├── hardware/                     ← Device Drivers
│   │   ├── daq_reader.py            → Lectura de termopares
│   │   ├── fuente_xln.py            → Control fuente Telnet
│   │   └── gpio_controller.py       → Control relés GPIO
│   │
│   ├── recording/
│   │   └── recording_manager.py     → Grabación CSV
│   │
│   ├── alerts/
│   │   └── alert_manager.py         → Sistema de alertas
│   │
│   ├── requirements.txt              → Dependencias Python
│   └── [otros archivos]
│
├── public/                           ← Assets estáticos
├── package.json                      ← Dependencias Node.js
├── vite.config.ts                    ← Configuración Vite
├── tsconfig.json                     ← Configuración TypeScript
├── tailwind.config.js                ← Configuración Tailwind
├── postcss.config.js
├── eslint.config.js                  ← Linting
├── index.html                        ← HTML entry point
├── start_server.py                   ← Script arranque
└── README.md
```

---

## 🎯 FLUJO POR CASO DE USO

### CASO 1: Usuario cambia voltaje

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario en navegador:                                        │
│    • Ve input "Voltaje: 0-300V"                                │
│    • Escribe "150"                                              │
│    • Presiona botón "Aplicar"                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend (FuenteControl.tsx):                                │
│    • handleSetVoltage() es llamado                              │
│    • Valida: 0 ≤ 150 ≤ 300  ✓                                   │
│    • Llama: await setVoltage(150)                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Hook useFuente (TS):                                         │
│    • setVoltage() hace POST a API                               │
│    • fetch('http://localhost:5000/api/fuente/voltage', {       │
│        method: 'POST',                                          │
│        body: JSON.stringify({ voltage: 150 })                  │
│      })                                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend (app.py):                                            │
│    @app.route('/api/fuente/voltage', methods=['POST'])         │
│    def set_voltage():                                           │
│        data = request.get_json()                                │
│        voltage = data['voltage']  # 150                         │
│        fuente.set_voltage(150)    ← Comando a dispositivo       │
│        return jsonify({'status': 'ok'})                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Driver Hardware (fuente_xln.py):                             │
│    def set_voltage(self, voltage):                              │
│        # Telnet a puerto 5024                                   │
│        self.tn.write(                                           │
│            f"VOLT {voltage}\r\n".encode()                      │
│        )                                                        │
│        response = self.tn.read_until(b'\n')                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Telnet port 5024
┌─────────────────────────────────────────────────────────────────┐
│ 6. Hardware (Fuente BK Precision XLN30052):                     │
│    Recibe comando: "VOLT 150"                                   │
│    Cambia voltaje de salida a 150V                              │
│    Responde: "OK\r\n"                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Data Acquisition Loop (cada 100ms):                          │
│    Lee nuevo voltaje: fuente.get_voltage_current()             │
│    Obtiene: (150.0, 2.3)  ← Nuevo voltaje leído               │
│    Crea LiveData actualizado                                    │
│    Envía por SSE al frontend                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓ SSE Event
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend (useLiveData hook):                                 │
│    Recibe evento SSE con nuevo voltaje                          │
│    setData(newData)  ← Actualiza state                          │
│    React re-renderiza componentes                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. Resultado en UI:                                             │
│    • FuenteControl muestra "Voltaje: 150.0V"  ✓                │
│    • Gráfica V-I se actualiza                                  │
│    • Gráfica Power se actualiza (P = V×I)                      │
│    • Alertas se checan (si excede límites)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### CASO 2: Encender relé #1 (Compresor)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario presiona botón "Compresor" en RelayControl          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend (RelayControl.tsx):                                │
│    • handleToggleRelay(0)                                       │
│    • fetch('http://localhost:5000/api/relay/0', {              │
│        method: 'POST',                                          │
│        body: JSON.stringify({ state: true })                   │
│      })                                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend (app.py):                                            │
│    @app.route('/api/relay/<int:relay_id>', methods=['POST'])   │
│    def toggle_relay(relay_id):                                  │
│        state = request.json['state']                            │
│        gpio.set_relay(relay_id, state)  ← GPIO manipulation    │
│        return jsonify({'status': 'ok'})                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. GPIO Driver (gpio_controller.py):                            │
│    def set_relay(self, relay_id, state):                        │
│        # relay_id=0 → BCM pin 17                                │
│        GPIO.setmode(GPIO.BCM)                                   │
│        GPIO.output(17, GPIO.HIGH if state else GPIO.LOW)       │
│        → Pone pin a alto/bajo                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ GPIO BCM pin 17
┌─────────────────────────────────────────────────────────────────┐
│ 5. Hardware (Relé Waveshare):                                   │
│    Pin 17 pasa a 3.3V                                           │
│    Relé se energiza                                             │
│    Contacto se cierra                                           │
│    Compresor se enciende (220V AC)                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Siguiente lectura de datos (100ms después):                 │
│    gpio.get_all_states() lee nuevos estados                    │
│    Retorna: [true, false, false, false]  ← Cambio detectado   │
│    Actualiza LiveData.relays                                   │
│    Envía por SSE                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Frontend actualiza UI:                                       │
│    RelayControl muestra relé #1 = ✓ ON (verde)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 ESTRUCTURA DE DATOS CLAVE

### LiveData (lo que se envía cada 100ms)

```typescript
interface LiveData {
  // Identificación temporal
  timestamp: string;              // ISO 8601: "2026-02-04T14:30:45.123Z"
  elapsed_time: number;           // Segundos desde inicio sesión
  
  // Mediciones de Fuente
  voltage: number;                // 0-300V (BK XLN30052)
  current: number;                // 0-5.2A (BK XLN30052)
  power: number;                  // Calculado: V × I
  
  // Mediciones de Temperatura
  temperatures: number[];          // 8 valores (0-100°C cada uno)
  //  [0] = T_Evap_In      (Entrada evaporador)
  //  [1] = T_Evap_Mid     (Centro evaporador)
  //  [2] = T_Evap_Out     (Salida evaporador)
  //  [3] = T_Comp         (Compresor)
  //  [4] = T_Cond_In      (Entrada condensador)
  //  [5] = T_Cond_Mid     (Centro condensador)
  //  [6] = T_Cond_Out     (Salida condensador)
  //  [7] = T_Ambient      (Temperatura ambiente)
  
  t_evap_avg: number;             // Promedio: (T0+T1+T2)/3
  t_cond_avg: number;             // Promedio: (T4+T5+T6)/3
  r_thermal: number;              // R_thermal = ΔT / Power
  
  // Estado de Relés
  relays: boolean[];              // 4 valores booleanos
  //  [0] = Compresor
  //  [1] = Ventilador Condensador
  //  [2] = Ventilador Evaporador
  //  [3] = Bomba
  
  // Estado del Sistema
  recording: boolean;             // ¿Está grabando CSV?
  fuente_connected: boolean;      // ¿Conectada la fuente?
  daq_connected: boolean;         // ¿Conectado el DAQ?
}
```

### SystemConfig (configuración persistente)

```python
@dataclass
class SystemConfig:
    fuente: FuenteConfig
    daq: DAQConfig
    alerts: AlertConfig
    recording_path: str
    
@dataclass
class FuenteConfig:
    host: str                      # "192.168.1.100"
    port: int                      # 5024
    max_voltage: float             # 300.0
    max_current: float             # 5.2
    max_power: float               # 1560.0 (300V × 5.2A)
    safe_limits: {
        'voltage': (0, 300),
        'current': (0, 5.2)
    }

@dataclass
class DAQConfig:
    device_id: int                 # 0
    channels: int                  # 8
    sample_rate: int               # Hz

@dataclass
class AlertConfig:
    t_evap_max: float              # 50.0°C
    t_cond_max: float              # 60.0°C
    t_ambient_max: float           # 35.0°C
    power_max: float               # 1500.0W
    enable_sound: bool             # True
```

---

## 🔌 PROTOCOLOS DE COMUNICACIÓN

### 1. HTTP REST (Frontend ↔ Backend)

```
ENDPOINTS disponibles:

GET  /api/status
     Retorna: LiveData (snapshot actual)
     Uso: Estado puntual

GET  /api/live-data  (SSE)
     Retorna: Stream de LiveData cada 100ms
     Uso: Datos en tiempo real
     
GET  /api/config
     Retorna: SystemConfig
     Uso: Obtener configuración

POST /api/fuente/voltage
     Body: { "voltage": 150.0 }
     Retorna: { "status": "ok" }

POST /api/fuente/current
     Body: { "current": 2.5 }
     Retorna: { "status": "ok" }

POST /api/fuente/output
     Body: { "state": true/false }
     Retorna: { "status": "ok" }

POST /api/relay/<id>
     Body: { "state": true/false }
     Retorna: { "status": "ok" }

GET  /api/recording/start
     Retorna: { "filename": "2026-02-04_14-30.csv" }

GET  /api/recording/stop
     Retorna: { "samples": 3045 }

GET  /api/alerts
     Retorna: [{ "timestamp": "...", "type": "...", "message": "..." }]
```

### 2. SSE (Server-Sent Events)

```
Conexión HTTP estándar que mantiene abierto socket:

Cliente:
  const es = new EventSource('http://localhost:5000/api/live-data');
  es.onmessage = (e) => {
    const data = JSON.parse(e.data);  // LiveData object
    // ... actualizar UI
  };

Servidor:
  yield f"data: {json.dumps(LiveData)}\n\n"
  # Envía cada 100ms

Ventaja:
  - Más eficiente que polling
  - Auto-reconnect
  - Bajo overhead
```

### 3. Telnet (Fuente XLN)

```
Conexión Telnet a puerto 5024:

Comando:  "VOLT 150\r\n"
Respuesta: "OK\r\n"

Comando:  "CURR 2.5\r\n"
Respuesta: "OK\r\n"

Comando:  "OUTPUT ON\r\n"
Respuesta: "OK\r\n"

Comando:  "MEAS:VOLT?\r\n"
Respuesta: "150.25\r\n"

Comando:  "MEAS:CURR?\r\n"
Respuesta: "2.34\r\n"

Nota: Comandos SCPI (Standard Commands for Programmable Instruments)
```

### 4. USB (DAQ USB5203)

```
Librería mcculw:

from mcculw import ul

device_index = 0
ul.a_in(board_num=device_index, channel=0)
  → Lee canal 0 (rango 0-100°C típico)

Rápido: ~50ms para 8 canales
```

### 5. GPIO (Relés Waveshare)

```
Librería RPi.GPIO:

import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)  # Pin BCM 17
GPIO.output(17, GPIO.HIGH)  # Pone alto (relé activo)

Pines mapeados:
  BCM 17 → Relé 1 (Compresor)
  BCM 27 → Relé 2 (Ventilador Cond)
  BCM 22 → Relé 3 (Ventilador Evap)
  BCM 10 → Relé 4 (Bomba)
```

---

## 🧠 LÓGICA DE PROCESAMIENTO

### Data Acquisition Loop (Python Flask thread)

```python
def data_acquisition_loop():
    while thread_running:
        # 1. Leer hardware (paralelo posible)
        temps = daq.read_all_channels()      # ~50ms
        voltage, current = fuente.get_voltage_current()  # ~30ms
        relays = gpio.get_all_states()      # <1ms
        
        # 2. Procesar datos (calculadora)
        power = voltage * current
        t_evap_avg = (temps[0] + temps[1] + temps[2]) / 3
        t_cond_avg = (temps[4] + temps[5] + temps[6]) / 3
        delta_t = abs(t_cond_avg - t_evap_avg)
        r_thermal = delta_t / power if power > 0.1 else 0
        
        # 3. Crear objeto LiveData
        current_data = LiveData(
            timestamp=datetime.now().isoformat(),
            elapsed_time=recorder.get_elapsed_time(),
            voltage=voltage,
            current=current,
            power=power,
            temperatures=temps,
            t_evap_avg=t_evap_avg,
            t_cond_avg=t_cond_avg,
            r_thermal=r_thermal,
            relays=relays,
            recording=recorder.is_recording,
            fuente_connected=fuente.is_connected(),
            daq_connected=daq.is_connected()
        )
        
        # 4. Verificar alertas
        alert_manager.check_data(current_data)
        
        # 5. Grabar si necesario
        if recorder.is_recording:
            recorder.write_data(current_data)
        
        # 6. Sincronizar a 10Hz
        elapsed = time.time() - start_time
        sleep_time = max(0, 0.1 - elapsed)
        time.sleep(sleep_time)
```

### Alert Manager

```python
class AlertManager:
    def check_data(self, data: LiveData):
        # Comparar con límites configurados
        
        if data.t_evap_avg > config.t_evap_max:
            self.create_alert(
                type='TEMP_OVERHEAT_EVAP',
                message=f'Evaporador: {data.t_evap_avg}°C'
            )
        
        if data.t_cond_avg > config.t_cond_max:
            self.create_alert(
                type='TEMP_OVERHEAT_COND',
                message=f'Condensador: {data.t_cond_avg}°C'
            )
        
        if data.power > config.power_max:
            self.create_alert(
                type='POWER_OVERHEAT',
                message=f'Potencia: {data.power}W'
            )
        
        # Frontend se entera por SSE + AlertsPanel
```

---

## 📊 CICLO DE RENDERIZADO FRONTEND

```
┌────────────────────────────────────────┐
│ Component Mounting                     │
│  App.tsx renders                       │
│  useLiveData hook initialized          │
│  EventSource conecta a /api/live-data  │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│ SSE Message recibido (100ms)           │
│  eventSource.onmessage trigger         │
│  JSON.parse(event.data)                │
│  setData(newData)  ← State update      │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│ React Reconciliation                   │
│  Calcula qué cambió en data            │
│  Prepara re-render                     │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│ Component Re-render                    │
│  TemperaturePanel: recibe               │
│    data.temperatures                   │
│    data.t_evap_avg                     │
│    data.t_cond_avg                     │
│  Actualiza DOM                         │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│ Chart Update (Chart.js)                │
│  TemperatureChart.tsx:                 │
│    addData(chart, newValue)            │
│    canvas.redraw()                     │
│  Re-renderiza canvas (~10ms)           │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│ UI actualizada visualmente             │
│  Usuario ve gráficas en movimiento     │
│  Historial de 300 puntos (~30 segundos)│
│  Promedio de temperaturas actualizado  │
└────────────────────────────────────────┘
```

---

## 🛡️ SEGURIDAD Y PROTECCIONES

### Validaciones Frontend

```typescript
// En FuenteControl.tsx
const handleSetVoltage = (v) => {
  if (!isNaN(v) && v >= 0 && v <= 300) {  // ✓ Rango
    setVoltage(v);
  }
};

const handleSetCurrent = (i) => {
  if (!isNaN(i) && i >= 0 && i <= 5.2) {  // ✓ Rango
    setCurrent(i);
  }
};
```

### Validaciones Backend

```python
@app.route('/api/fuente/voltage', methods=['POST'])
def set_voltage():
    data = request.get_json()
    voltage = float(data['voltage'])
    
    # ✓ Validar rango
    if not (0 <= voltage <= system_config.fuente.max_voltage):
        return jsonify({'error': 'Voltaje fuera de rango'}), 400
    
    # ✓ Validar potencia
    power = voltage * current
    if power > system_config.fuente.max_power:
        return jsonify({'error': 'Potencia excedida'}), 400
    
    fuente.set_voltage(voltage)
    return jsonify({'status': 'ok'})
```

### Límites del Sistema

```python
SAFE_LIMITS = {
    'voltage': (0, 300),           # V
    'current': (0, 5.2),           # A
    'power': (0, 1560),            # W
    't_evap_max': 50,              # °C
    't_cond_max': 60,              # °C
    't_ambient_max': 35            # °C
}
```

### Protecciones Hardware

```python
# Si falla conexión con fuente
if not fuente.is_connected():
    # No enviar comandos
    # Mostrar error en UI
    return error_response()

# Si falla DAQ
if not daq.is_connected():
    # Usar últimos datos conocidos
    # Alertar al usuario
    # No grabar sin datos confiables
```

---

## 🚀 PERFORMANCE

### Timing esperado

```
Lectura Hardware:       ~80ms  (DAQ 50ms + Fuente 30ms)
Procesamiento:          <1ms   (cálculos simples)
Creación JSON:          ~5ms
Envío SSE:              ~5ms
────────────────────────────
Total por ciclo:        ~91ms  ✓ < 100ms objetivo
```

### Optimizaciones

```typescript
// 1. Usar useCallback para evitar re-renders innecesarios
const connect = useCallback(() => { ... }, []);

// 2. Usar useRef para EventSource (no causa re-render)
const eventSourceRef = useRef<EventSource | null>(null);

// 3. Limitar gráficas a MAX_POINTS = 300 (30 segundos)
// Evita que canvas se quede sin memoria

// 4. Usar SSE en lugar de polling
// Reduce tráfico 10x (push vs pull)

// 5. Thread separado para data_acquisition_loop
// No bloquea responses HTTP
```

### Escalabilidad

```
Múltiples clientes:
  - Cada cliente abre EventSource
  - Servidor enva el mismo SSE a todos
  - CPU backend: ~2-5% (thread de datos) + ~5-10% (HTTP)
  - Memoria: ~50MB base + ~10MB por cliente

Raspberry Pi 4:
  ✓ 4GB RAM → Soporta sin problemas
  ✓ CPU cuádruple 1.5GHz → Suficiente

Raspberry Pi 3:
  ⚠ 1GB RAM → Considerar swap
  ⚠ CPU cuádruple 1.2GHz → Ajustar sample rate
```

---

## 📝 SUMMARY RÁPIDO

| Componente | Tecnología | Propósito |
|-----------|-----------|----------|
| **Frontend** | React 19 + TypeScript | UI responsiva |
| **Styling** | Shadcn/ui + TailwindCSS | Componentes profesionales |
| **Gráficas** | Chart.js + react-chartjs-2 | Visualización datos |
| **Backend** | Flask 3.0 | API REST + SSE |
| **Datos** | SSE (Server-Sent Events) | Streaming tiempo real |
| **DAQ** | USB5203 + mcculw | 8 termopares |
| **Fuente** | BK XLN30052 + Telnet | Control 0-300V, 0-5.2A |
| **Relés** | GPIO BCM + RPi.GPIO | 4 relés controlables |
| **Recording** | CSV recorder | Archivo de datos |
| **Alertas** | Alert Manager | Sistema notificaciones |

---

## 🔍 PRÓXIMOS PASOS

1. **Entender cada componente**:
   - Abre `src/components/` y lee un archivo
   - Busca `export function ComponentName()`
   - Seguí qué props recibe del padre

2. **Testear localmente**:
   - `npm install && npm run dev`
   - `python backend/app.py`
   - Abre http://localhost:5173

3. **Debuggear con DevTools**:
   - F12 → Network → filtra `/api/`
   - Ve los requests HTTP
   - Ve las respuestas SSE

4. **Entender el flujo de datos**:
   - Sigue un cambio de voltaje desde UI hasta hardware
   - Traza cómo vuelve la lectura al frontend

---

**Documentación v1.0 - 4 de febrero de 2026**
