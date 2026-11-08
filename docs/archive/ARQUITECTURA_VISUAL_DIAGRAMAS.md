# 🏗️ ARQUITECTURA VISUAL DEL SISTEMA - 2026

**Documento**: Diagramas de flujo y arquitectura del LabPiPanel  
**Fecha**: 4 febrero 2026  
**Versión**: Post-Migración Monorepo

---

## 1. FLUJO DE INICIO (Boot Sequence)

```
┌─────────────────────────────────────────────────────────┐
│ RASPBERRY PI 3 SE ENCIENDE                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Systemd carga servicio: labpipanel.service              │
│ Ejecuta: python3 /home/pi/LabPiPanel/apps/backend/app.py│
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────────┐
         │ apps/backend/app.py     │  ◄── PUNTO DE ENTRADA
         │ Puerto: 5000            │
         │ - Inicializa Flask      │
         │ - Carga SystemConfig    │
         │ - Conecta hardware      │
         └────────┬────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌──────────┐
    │ DAQ    │ │ Fuente │ │ GPIO     │
    │USB5203 │ │ XLN30  │ │ Relés    │
    │ 8 ch   │ │Telnet  │ │ 4x Active│
    │10 Hz   │ │5024    │ │ LOW      │
    └───┬────┘ └───┬────┘ └────┬─────┘
        │          │           │
        └──────────┼───────────┘
                   │
                   ▼
         ┌─────────────────────────┐
         │ data_acquisition_loop() │
         │ Thread @ 10 Hz (100ms)  │
         │                         │
         │ • Lee temperaturas      │
         │ • Calcula promedios     │
         │ • Obtiene V/I/P         │
         │ • Detecta alertas       │
         └────────┬────────────────┘
                  │
                  ▼
         ┌─────────────────────────┐
         │ SSE /api/live-data      │
         │ Envía JSON cada 100ms   │
         │ al navegador web        │
         └────────┬────────────────┘
                  │
                  ▼
    ┌──────────────────────────────────┐
    │ Frontend (React + Vite)          │
    │ Puerto: 5173 (dev) / 80 (prod)   │
    │                                  │
    │ • Recibe SSE                     │
    │ • Actualiza gráficos             │
    │ • Muestra estado tiempo real     │
    │ • Controla relés                 │
    └──────────────────────────────────┘
```

---

## 2. ARQUITECTURA DE DATOS

```
┌────────────────────────────────────────────────────────────────┐
│                      SISTEMA LABPIPANEL                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HARDWARE (Real en Pi, Simulado en Dev)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  DAQ USB5203 │  │ Fuente XLN30 │  │  GPIO Relés  │       │
│  │  8 Canales   │  │  Telnet 5024 │  │  4 Canales   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                 │
│                           │                                   │
│  BACKEND (Flask)          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  app.py (Port 5000)                                  │   │
│  │                                                      │   │
│  │  ├─ data_acquisition_loop()                          │   │
│  │  │  └─ Lee hardware @ 10Hz                           │   │
│  │  │  └─ Calcula ΔT, R_thermal                         │   │
│  │  │  └─ Actualiza LiveData                            │   │
│  │  │                                                    │   │
│  │  ├─ /api/status                                      │   │
│  │  ├─ /api/live-data (SSE)                             │   │
│  │  ├─ /api/config/*                                    │   │
│  │  ├─ /api/relay/{id}                                  │   │
│  │  ├─ /api/recording/*                                 │   │
│  │  └─ /api/alerts/*                                    │   │
│  │                                                      │   │
│  │  Memoria Global:                                     │   │
│  │  ├─ system_config: SystemConfig                      │   │
│  │  ├─ current_data: LiveData                           │   │
│  │  ├─ system_status: SystemStatus                      │   │
│  │  └─ thread_running: bool                             │   │
│  │                                                      │   │
│  │  Instancias Hardware:                                │   │
│  │  ├─ daq: DAQReader()                                 │   │
│  │  ├─ fuente: FuenteXLN()                              │   │
│  │  ├─ gpio: GPIOController()                           │   │
│  │  ├─ recorder: RecordingManager()                     │   │
│  │  └─ alert_manager: AlertManager()                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                     │
│         └──────────────────┬──────────────────────────────┐   │
│                            │                              │   │
│  GRABACIÓN (CSV)           ▼                              │   │
│  ┌──────────────────────────────────────────────────┐   │   │
│  │  results/experiment_*.csv                        │   │   │
│  │  Timestamp, T1-T8, V, I, P, Status               │   │   │
│  └──────────────────────────────────────────────────┘   │   │
│                                                         │   │
│  OLED I2C (NUEVO)                                       │   │
│  ┌──────────────────────────────────────────────────┐   │   │
│  │  oled_driver.py                                  │   │   │
│  │  - write_status()                                │   │   │
│  │  - write_alert()                                 │   │   │
│  │  - write_progress()                              │   │   │
│  └──────────────────────────────────────────────────┘   │   │
│                                                         │   │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript)                             │
│  App.tsx @ localhost:5173                                  │
│                                                            │
│  ├─ Recibe SSE de /api/live-data cada 100ms               │
│  │                                                        │
│  ├─ Componentes:                                          │
│  │  ├─ ConfigPanel.tsx                                    │
│  │  │  ├─ Tab: Fuente XLN                                 │
│  │  │  ├─ Tab: DAQ (Editar canales + zonas)               │
│  │  │  ├─ Tab: Alertas                                    │
│  │  │  └─ Tab: Relés (Editar etiquetas)                   │
│  │  │                                                    │
│  │  ├─ TemperaturePanel.tsx                               │
│  │  │  ├─ 8 Canales individuales                          │
│  │  │  ├─ T_Evap_Avg                                      │
│  │  │  └─ T_Cond_Avg                                      │
│  │  │                                                    │
│  │  ├─ TemperatureChart.tsx                               │
│  │  │  └─ Gráfico histórico (300 puntos = 30s)            │
│  │  │                                                    │
│  │  ├─ VoltageCurrentChart.tsx                            │
│  │  │  └─ Voltaje y Corriente en tiempo real               │
│  │  │                                                    │
│  │  ├─ RelayControl.tsx                                   │
│  │  │  ├─ 4 Botones ON/OFF                                │
│  │  │  ├─ LED status visual                               │
│  │  │  └─ Etiquetas editables                             │
│  │  │                                                    │
│  │  ├─ ExperimentPanel.tsx (NUEVO)                        │
│  │  │  ├─ Selector de experimentos                        │
│  │  │  ├─ Control start/stop/pause                        │
│  │  │  └─ Progress bar                                    │
│  │  │                                                    │
│  │  └─ AlertSystem.tsx                                    │
│  │     └─ Notificaciones visuales                         │
│  │                                                        │
│  └─ State Management (Hooks):                             │
│     ├─ useLiveData: SSE subscription                      │
│     ├─ useConfig: Fetch config + update                   │
│     ├─ useRelays: Toggle relés                            │
│     └─ useRecording: Grabar CSV                           │
└────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO DE DATOS EN TIEMPO REAL

```
              ┌─── Cada 100ms (10 Hz) ───┐
              │                          │
              ▼                          │
    ┌──────────────────┐                │
    │ Leer DAQ (8ch)   │                │
    └────────┬─────────┘                │
             │                          │
             ▼                          │
    ┌──────────────────────────┐        │
    │ Leer Fuente XLN (V,I)    │        │
    │ P = V × I                │        │
    └────────┬─────────────────┘        │
             │                          │
             ▼                          │
    ┌──────────────────────────┐        │
    │ Calcular Promedios       │        │
    │ por Zona                 │        │
    │ - T_Evap_Avg (zonas)     │        │
    │ - T_Cond_Avg (zonas)     │        │
    │ - R_Thermal = ΔT / P     │        │
    └────────┬─────────────────┘        │
             │                          │
             ▼                          │
    ┌──────────────────────────┐        │
    │ Crear LiveData()         │        │
    │ timestamp, temps[8],     │        │
    │ voltage, current, power, │        │
    │ t_evap_avg, t_cond_avg,  │        │
    │ r_thermal, relay_states  │        │
    └────────┬─────────────────┘        │
             │                          │
    ┌────────┴─────────┬────────────────┤
    │                  │                │
    ▼                  ▼                ▼
┌────────────┐  ┌─────────────┐  ┌──────────────┐
│ Verificar  │  │ Grabar en   │  │ Enviar SSE   │
│ Alertas    │  │ CSV         │  │ /api/live-   │
│            │  │ (si activo) │  │ data         │
└────────────┘  └─────────────┘  └──────────────┘
                                       │
                                       ▼
                                   Browser
                                   (React)
                                   │
                                   ├─ actualiza charts
                                   ├─ actualiza panels
                                   └─ re-render UI
```

---

## 4. VARIABLES EXPERIMENTALES (Mapeo)

```
┌──────────────────────────────────────────────────────────┐
│           EXPERIMENTO TÉRMICO AUTOMATIZADO               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Entrada (Configuración)                                 │
│  ┌────────────────────────────────────┐                 │
│  │ power_w: [10, 25, 50] W             │                │
│  │ duration_sec: 600 s                 │                │
│  │ sample_rate_hz: 1 Hz                │                │
│  │ resistance_ohm: 50 Ω                │                │
│  └────────────────────────────────────┘                 │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                 │
│  │ Cálculo de Voltaje/Corriente        │                │
│  │ V = √(P × R)  = √(10 × 50) = 22.4V │                │
│  │ I = V / R     = 22.4 / 50 = 0.448A  │                │
│  │ P = V × I     = 22.4 × 0.448 ≈ 10W │                │
│  └────────────────────────────────────┘                 │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                 │
│  │ Aplicar a Fuente XLN               │                │
│  │ - Setpoint: 22.4V @ 0.448A          │                │
│  │ - Output ON                         │                │
│  │ - Duration: 600s                    │                │
│  └────────────────────────────────────┘                 │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                │
│  │ Adquisición de Datos (10 Hz)        │                │
│  │ Cada 100ms:                         │                │
│  │ - Lee T1-T8 (termopares)             │                │
│  │ - Lee V, I actual de fuente          │                │
│  │ - Calcula T_Evap_Avg, T_Cond_Avg    │                │
│  │ - Calcula R_thermal = ΔT / P         │                │
│  │ - Detección de alertas               │                │
│  └────────────────────────────────────┘                 │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                │
│  │ Almacenamiento                      │                │
│  │ CSV: Timestamp, T1-T8, V, I, P,     │                │
│  │      T_Evap, T_Cond, R_thermal      │                │
│  │      Alert_Status                   │                │
│  └────────────────────────────────────┘                 │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                │
│  │ Post-Procesamiento                  │                │
│  │ - Promedio: ΣR_thermal / N          │                │
│  │ - Desv. Est: √(Σ(R-R_avg)²/(N-1))   │                │
│  │ - Min/Max: T_Evap, T_Cond           │                │
│  │ - Time constant: τ = -t / ln(ΔT/ΔT₀)│               │
│  └────────────────────────────────────┘                │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────┐                │
│  │ Salida (Resultados)                 │                │
│  │ - Gráficos de T vs t                │                │
│  │ - R_thermal promedio                │                │
│  │ - Constante térmica τ               │                │
│  │ - Validación de precisión           │                │
│  └────────────────────────────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 5. ESTRUCTURA DE CARPETAS (Monorepo)

```
LabPiPanel/
│
├── 📄 Documentación
│   ├── ANALISIS_ESTRUCTURA_EXPERIMENTAL.md    ✅ HOY
│   ├── PUNTO_ENTRADA_SYSTEM.md                ✅ HOY
│   ├── RESUMEN_INTEGRIDAD_SISTEMA.md          ✅ HOY
│   ├── ARQUITECTURA_VISUAL_DIAGRAMAS.md       ✅ HOY (este archivo)
│   ├── API.md
│   ├── HARDWARE.md
│   └── README.md
│
├── 📁 apps/
│   │
│   ├── backend/
│   │   ├── app.py                              ✅ ENTRADA PRINCIPAL
│   │   │
│   │   ├── hardware/
│   │   │   ├── daq_reader.py                   ✅ OK
│   │   │   ├── fuente_xln.py                   ✅ OK
│   │   │   ├── gpio_controller.py              ✅ OK
│   │   │   └── oled_driver.py                  ✅ CREADO HOY
│   │   │
│   │   ├── models/
│   │   │   ├── data_models.py                  ✅ OK
│   │   │   └── experiment_models.py            ❌ PENDIENTE
│   │   │
│   │   ├── experiments/                        ❌ PENDIENTE
│   │   │   ├── thermal_experiment_v2.py
│   │   │   └── experiment_manager.py
│   │   │
│   │   ├── recording/
│   │   │   └── recording_manager.py            ✅ OK
│   │   │
│   │   ├── alerts/
│   │   │   └── alert_manager.py                ✅ OK
│   │   │
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx
│       │   │
│       │   ├── components/
│       │   │   ├── ConfigPanel.tsx             ✅ FIXED
│       │   │   ├── TemperaturePanel.tsx        ✅ OK
│       │   │   ├── TemperatureChart.tsx        ✅ OK
│       │   │   ├── VoltageCurrentChart.tsx     ✅ OK
│       │   │   ├── RelayControl.tsx            ✅ OK
│       │   │   ├── AlertSystem.tsx             ✅ OK
│       │   │   └── ExperimentPanel.tsx         ❌ PENDIENTE
│       │   │
│       │   ├── hooks/
│       │   │   ├── useLiveData.ts              ✅ FIXED
│       │   │   ├── useConfig.ts                ✅ OK
│       │   │   └── useRecording.ts             ✅ OK
│       │   │
│       │   ├── types/
│       │   │   └── index.ts                    ✅ OK
│       │   │
│       │   └── utils/
│       │       ├── csvExporter.ts
│       │       └── dataSimulator.ts
│       │
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── 📁 scripts/
│   ├── start-dev.ps1                          ✅ OK
│   └── start-dev.sh                           ✅ OK
│
├── 📄 Raíz (Legado 2025)
│   ├── thermal_experiment.py                  ✅ Analizado
│   ├── daq_usb5203.py
│   ├── fuente_xln.py
│   ├── relay_controller.py
│   └── config.py                              ✅ Analizado
│
├── 📁 results/
│   └── *.csv                                  (Grabaciones)
│
├── 📁 logs/
│   └── app.log
│
├── Dockerfile
├── docker-compose.yml
├── Makefile                                   ✅ OK
├── package.json                               ✅ OK
└── requirements.txt
```

---

## 6. SECUENCIA DE UN EXPERIMENTO COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│ SECUENCIA: EXPERIMENTO TÉRMICO AUTOMATIZADO              │
└─────────────────────────────────────────────────────────┘

T=0: Usuario inicia experimento desde UI
    │
    ▼
    POST /api/experiments/run
    {
      "experiment_id": "full_characterization",
      "levels": [
        {"power_w": 10, "duration_sec": 600, ...},
        {"power_w": 25, "duration_sec": 600, ...},
        {"power_w": 50, "duration_sec": 600, ...}
      ]
    }
    │
    ▼
    Backend: experiment_manager.start_experiment()
    │
    ├─ Validar límites (V<300V, I<5.2A, P<1600W)
    │
    ├─ Crear CSV para resultados
    │
    └─ LEVEL 1: 10W durante 600s
       │
       ▼
       Calcular: V = √(10×50) = 22.4V, I = 0.448A
       │
       ▼
       Fuente.set_voltage(22.4)
       Fuente.set_current(0.448)
       Fuente.output_on()
       │
       ▼
       LOOP 600 veces (cada segundo):
       │
       ├─ Leer T1-T8
       ├─ Leer V, I reales
       ├─ Calcular T_Evap_Avg, T_Cond_Avg
       ├─ Calcular R_thermal
       ├─ Grabar en CSV
       ├─ SSE broadcast data
       ├─ Verificar alertas
       └─ UI actualiza progress bar (0-33%)
       │
       ▼
       Fuente.output_off()
       Esperar 2 minutos (estabilización térmica)
       │
       └─ LEVEL 2: 25W durante 600s (similar)
           │
           └─ LEVEL 3: 50W durante 600s (similar)
               │
               ▼
               Experimento completado
               │
               ├─ Generar reporte JSON
               ├─ Calcular estadísticas finales
               ├─ Permitir descarga de CSV
               └─ UI muestra resultados
```

---

## 7. FLUJO DE CONTROL DE RELÉS

```
┌──────────────────────────────────────────┐
│     CONTROL DE RELÉS (GPIO)              │
├──────────────────────────────────────────┤
│                                          │
│  Frontend: RelayControl.tsx              │
│  ┌──────────────────────────────────┐   │
│  │ [COMPRESOR]     [VENTILADOR COND]│   │
│  │ ●ON  ○OFF       ●ON  ○OFF        │   │
│  │ [VENTILADOR EV] [BOMBA]          │   │
│  │ ○ON  ●OFF       ●ON  ○OFF        │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│                 │ POST /api/relay/{id}  │
│                 │ {"state": true/false} │
│                 │                        │
│                 ▼                        │
│  Backend: app.py                        │
│  ┌──────────────────────────────────┐   │
│  │ @app.route('/api/relay/{id}')    │   │
│  │                                  │   │
│  │ gpio.set_relay(id, state)        │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│                 ▼                        │
│  Hardware: gpio_controller.py           │
│  ┌──────────────────────────────────┐   │
│  │ Relé 1 (GPIO26) - Compresor      │   │
│  │ Relé 2 (GPIO20) - Ventilador Cond│   │
│  │ Relé 3 (GPIO21) - Ventilador Evap│   │
│  │ Relé 4 (GPIO16) - Bomba          │   │
│  │                                  │   │
│  │ Lógica: Active LOW               │   │
│  │ GPIO=LOW  → Relé activado (ON)   │   │
│  │ GPIO=HIGH → Relé desactivado     │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│                 ▼                        │
│  Circuito de Potencia                   │
│  ┌──────────────────────────────────┐   │
│  │ Compresor (5 HP, 3.7 kW)         │   │
│  │ Ventilador Condensador (1 HP)    │   │
│  │ Ventilador Evaporador (0.5 HP)   │   │
│  │ Bomba de Fluido (250W)           │   │
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 8. LÍNEA DE TIEMPO DE DESARROLLO

```
┌──────────────────────────────────────────────────────────┐
│ ROADMAP: LabPiPanel 2026                                │
└──────────────────────────────────────────────────────────┘

FEB 4 (HOY) ✅
└─ Análisis completo de integridad
└─ Documentación arquitectura
└─ Driver OLED creado

FEB 5-6 (Esta semana) 🔴 CRÍTICA
├─ Crear thermal_experiment_v2.py
├─ Crear experiment_models.py
├─ API endpoints /api/experiments/*
└─ Testing local completo

FEB 10-15 (Semana 2) 🟡 IMPORTANTE
├─ ExperimentPanel.tsx (UI)
├─ Integrar OLED en backend
├─ Testear en Raspberry Pi
└─ Setup systemd service

FEB 20-28 (Semana 3) 🟢 OPTIMIZACIÓN
├─ Persistencia de configuración (JSON)
├─ Import/Export presets
├─ Dashboard avanzado
└─ Documentación final

MARZO (Producción)
├─ Clonación múltiple de SD cards
├─ Deployment a 5+ laboratorios ITM
└─ Training a técnicos
```

---

**Diagrama Generado**: 4-Feb-2026  
**Versión**: 2.0 (Post-Migración)  
**Estado**: ✅ Completo
