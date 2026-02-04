# ANEXO VISUAL: DIAGRAMA DE INTEGRACIÓN Y REFERENCIAS

**Documento complementario al reporte de integración**  
**LabPiPanel + Frontend Kimi**

---

## 📐 ARQUITECTURA PROPUESTA FINAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LABPIPANEL v1.1 - KIMI INTEGRATION               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  FRONTEND (React + Vite + Kimi UI)                         │    │
│  │  IA/project_kimi/dist/                                     │    │
│  │                                                            │    │
│  │  • Dashboard en tiempo real                               │    │
│  │  • Gráficos avanzados (8 termopares)                      │    │
│  │  • Panel de configuración                                 │    │
│  │  • Sistema de alertas                                     │    │
│  │  • Control de relés etiquetado                            │    │
│  │  • Grabación y exportación CSV                            │    │
│  └─────────┬──────────────────────────────────┬──────────────┘    │
│            │                                  │                     │
│  ┌─────────▼──────────────┐      ┌───────────▼────────────────┐   │
│  │ HTTP REST API          │      │ WebSocket (Socket.io)      │   │
│  │ /api/status            │      │ emit: request_live_data    │   │
│  │ /api/config            │      │ emit: live_data (100ms)    │   │
│  │ /api/fuente/*          │      │ emit: alert                │   │
│  │ /api/relay/*           │      │ emit: recording            │   │
│  │ /api/recording/*       │      │                            │   │
│  └─────────┬──────────────┘      └───────────┬────────────────┘   │
│            │                                  │                     │
│            └──────────────────┬───────────────┘                     │
│                               │                                     │
│  ┌────────────────────────────▼──────────────────────────────┐     │
│  │  BACKEND (Python Flask + Socket.io)                       │     │
│  │  labpipanel.py                                            │     │
│  │                                                            │     │
│  │  ┌──────────────────────────────────────────────────┐    │     │
│  │  │  API Routes (HTTP REST)                          │    │     │
│  │  │  • GET  /api/status                              │    │     │
│  │  │  • GET  /api/config                              │    │     │
│  │  │  • POST /api/config                              │    │     │
│  │  │  • POST /api/fuente/voltage                      │    │     │
│  │  │  • POST /api/fuente/current                      │    │     │
│  │  │  • POST /api/fuente/output                       │    │     │
│  │  │  • POST /api/relay/{1-4}                         │    │     │
│  │  └──────────────────────────────────────────────────┘    │     │
│  │                                                            │     │
│  │  ┌──────────────────────────────────────────────────┐    │     │
│  │  │  WebSocket (Socket.io)                           │    │     │
│  │  │  • Evento: request_live_data                     │    │     │
│  │  │  • Evento: live_data (cada 100ms)                │    │     │
│  │  │  • Evento: stop_live_data                        │    │     │
│  │  │  • Evento: alert                                 │    │     │
│  │  └──────────────────────────────────────────────────┘    │     │
│  │                                                            │     │
│  │  ┌──────────────────────────────────────────────────┐    │     │
│  │  │  Hardware Drivers (Modules)                      │    │     │
│  │  │  ┌──────────────────────────────────────────┐   │    │     │
│  │  │  │ fuente_xln.py                            │   │    │     │
│  │  │  │ • Telnet control (port 5024)             │   │    │     │
│  │  │  │ • Set voltage/current                     │   │    │     │
│  │  │  │ • Get power readings                      │   │    │     │
│  │  │  └──────────────────────────────────────────┘   │    │     │
│  │  │  ┌──────────────────────────────────────────┐   │    │     │
│  │  │  │ daq_usb5203.py                           │   │    │     │
│  │  │  │ • USB communication                       │   │    │     │
│  │  │  │ • Read 8 thermocouples (K-type)          │   │    │     │
│  │  │  │ • 24-bit ADC with CJC                    │   │    │     │
│  │  │  └──────────────────────────────────────────┘   │    │     │
│  │  │  ┌──────────────────────────────────────────┐   │    │     │
│  │  │  │ relay_controller.py                      │   │    │     │
│  │  │  │ • GPIO control (BCM pins)                │   │    │     │
│  │  │  │ • 4 relay channels (pump, fans)          │   │    │     │
│  │  │  └──────────────────────────────────────────┘   │    │     │
│  │  └──────────────────────────────────────────────────┘    │     │
│  │                                                            │     │
│  └────────────────────────────────────────────────────────────┘    │
│            │                                  │                     │
└────────────┼──────────────────────────────────┼─────────────────────┘
             │                                  │
    ┌────────▼──────────┐              ┌───────▼──────────┐
    │  HARDWARE         │              │  PERSISTENCE     │
    │                   │              │                  │
    │  Fuente XLN       │              │  config/         │
    │  (192.168.1.100)  │              │  system.json     │
    │                   │              │                  │
    │  DAQ USB-5203     │              │  results/        │
    │  (8 channels)     │              │  *.csv files     │
    │                   │              │                  │
    │  GPIO Relés       │              │  logs/           │
    │  (4 channels)     │              │  *.log files     │
    │                   │              │                  │
    └───────────────────┘              └──────────────────┘
```

---

## 🔄 FLUJO DE DATOS EN TIEMPO REAL

```
CICLO CADA 100ms:

Cliente WebSocket (Frontend)
     │
     │ socket.emit('request_live_data')
     │
     ▼
┌─────────────────────────────────┐
│  Backend - broadcast_live_data  │
│  Thread que corre continuamente  │
└─────────────────────────────────┘
     │
     │ gather_live_data():
     │
     ├─▶ fuente.get_voltage()  ──┐
     ├─▶ fuente.get_current()  ──┤─▶ Calcula potencia
     │                             │
     ├─▶ daq.get_temperature(0-7) ┤─▶ Calcula promedios
     │                             │
     └─▶ relay.get_all_states()  ──┤─▶ Resistencia térmica
     
     ▼
┌─────────────────────────────────┐
│  Estructura LiveData JSON        │
│  {                              │
│    timestamp, voltaje,          │
│    corriente, potencia,         │
│    T_ch0...T_ch7,              │
│    T_evap_avg, T_cond_avg,     │
│    R_thermal, relay_1..4       │
│  }                              │
└─────────────────────────────────┘
     │
     │ socketio.emit('live_data', data)
     │ → Todos los clientes conectados
     │
     ▼
Cliente WebSocket (Frontend)
     │
     │ socket.on('live_data', newData)
     │
     ├─▶ Actualiza estado React
     │
     └─▶ Re-render componentes
         ├─ RealtimeCharts
         ├─ PowerSourceControl
         ├─ AlertSystem
         ├─ RelayControl
         └─ SettingsPanel
```

---

## 📦 MATRIZ DE CAMBIOS POR ARCHIVO

```
BACKEND:
════════════════════════════════════════════════════════════════════

labpipanel.py
├─ [AGREGAR] Imports: flask_cors, flask_socketio, threading
├─ [AGREGAR] CORS(app)
├─ [AGREGAR] socketio = SocketIO(app, ...)
├─ [AGREGAR] Funciones: load_config_from_file(), save_config_to_file()
├─ [AGREGAR] Función: gather_live_data()
├─ [AGREGAR] Ruta: GET /api/config
├─ [AGREGAR] Ruta: POST /api/config
├─ [AGREGAR] WebSocket handlers: @socketio.on('connect', 'disconnect', ...)
├─ [AGREGAR] Thread: broadcast_live_data()
├─ [MODIFICAR] Main: app.run() → socketio.run()
└─ [LÍNEAS TOTALES] +200 líneas

requirements.txt
├─ [AGREGAR] flask-cors>=4.0.0
├─ [AGREGAR] flask-socketio>=5.3.5
├─ [AGREGAR] python-socketio>=5.10.0
├─ [AGREGAR] python-engineio>=4.8.0
└─ [LÍNEAS TOTALES] +4 líneas

config.py
├─ [AGREGAR] Configuración de seguridad
└─ [LÍNEAS TOTALES] +10 líneas


FRONTEND:
════════════════════════════════════════════════════════════════════

src/utils/apiClient.ts [NUEVO]
└─ ~150 líneas: Cliente HTTP para comunicación

src/hooks/useLiveData.ts [NUEVO]
└─ ~80 líneas: Hook WebSocket

src/hooks/useFuenteControl.ts [NUEVO]
└─ ~120 líneas: Hook control fuente

src/types/index.ts
├─ [VERIFICAR] Interfaces de tipos
└─ [LÍNEAS MODIFICADAS] ~10 líneas

src/App.tsx
├─ [REEMPLAZAR] useLiveData hook
├─ [AGREGAR] useFuenteControl hook
├─ [REMOVER] Simulador de datos
└─ [LÍNEAS MODIFICADAS] ~50 líneas

.env.local [NUEVO]
└─ Variables de entorno


INFRAESTRUCTURA:
════════════════════════════════════════════════════════════════════

Dockerfile
├─ [ACTUALIZAR] Platform: linux/arm64
├─ [AGREGAR] Node 20
└─ [LÍNEAS MODIFICADAS] ~30 líneas

docker-compose.yml
├─ [ACTUALIZAR] Variables de entorno
└─ [LÍNEAS MODIFICADAS] ~10 líneas

scripts/setup-rpi.sh [NUEVO]
└─ ~70 líneas

scripts/deploy-native.sh [NUEVO]
└─ ~35 líneas

nginx.conf [NUEVO]
└─ ~40 líneas


DOCUMENTACIÓN:
════════════════════════════════════════════════════════════════════

README.md
├─ [AGREGAR] Sección: Frontend Kimi
└─ [LÍNEAS AGREGADAS] ~30 líneas

API.md
├─ [AGREGAR] WebSocket endpoints
├─ [AGREGAR] Nuevo /api/config
└─ [LÍNEAS AGREGADAS] ~50 líneas

.env.example
├─ [AGREGAR] Nuevas variables
└─ [LÍNEAS AGREGADAS] ~5 líneas


RESUMEN DE CAMBIOS:
════════════════════════════════════════════════════════════════════
Archivos modificados: 8
Archivos nuevos:      7
Líneas de código:     ~500 (backend/frontend)
Documentación:        ~200 líneas
Configuración:        ~150 líneas
Scripts:              ~150 líneas

TOTAL: ~1000 líneas de trabajo
```

---

## 🔐 MATRIZ DE SEGURIDAD

```
┌─────────────────────────────────────────────────────────────┐
│  NIVEL 1: VALIDACIÓN EN FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Rango de voltaje: 0-300V                               │
│  • Rango de corriente: 0-5.2A                             │
│  • Confirmación para V > 100V                             │
│  • Deshabilitación de controles si desconectado           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NIVEL 2: VALIDACIÓN EN BACKEND (API)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Validación de rangos                                   │
│  • Rechazo de valores fuera de rango                      │
│  • Logging de intentos inválidos                          │
│  • Timeout de 30 segundos                                 │
│  • Rate limiting (opcional)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NIVEL 3: PROTECCIONES DE HARDWARE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Fuente XLN:                                              │
│  • OVP (Over Voltage Protection): 310V                    │
│  • OCP (Over Current Protection): 5.5A                    │
│  • OPP (Over Power Protection): 1600W                     │
│                                                             │
│  Sistema:                                                 │
│  • Watchdog Timer: Timeout 30s                            │
│  • Auto-shutdown si T > 120°C                             │
│  • Auto-shutdown si T < -40°C                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NIVEL 4: AUDITORÍA Y MONITOREO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Logging de todas las acciones                          │
│  • Registro de temperaturas anomalías                     │
│  • Alertas en tiempo real                                 │
│  • Histórico en CSV                                       │
│  • Notificaciones en interfaz                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ RENDIMIENTO ESPERADO

```
┌──────────────────────────────────────────────────────────┐
│  RASPBERRY PI 4 (4GB RAM)                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CPU:         30-40% en operación normal                │
│  RAM:         300-400MB usado                           │
│  Temp CPU:    45-55°C operación normal                  │
│  Latencia:    WebSocket < 100ms                         │
│  Throughput:  10 mensajes/segundo cómodamente           │
│  Uptime:      > 72 horas sin problemas                  │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  RASPBERRY PI 3 (1GB RAM) ⚠️ REQUIERE OPTIMIZACIÓN      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CPU:         50-70% en operación normal                │
│  RAM:         600-700MB usado (con swap)                │
│  Temp CPU:    60-70°C operación normal                  │
│  Latencia:    WebSocket 150-200ms                       │
│  Throughput:  5 mensajes/segundo óptimo                 │
│  Recomendación: Usar RPi4 o aumentar swap               │
│                                                          │
└──────────────────────────────────────────────────────────┘

MÉTRICAS POR COMPONENTE:

Frontend (Browser):
├─ Tamaño bundle: ~500KB (gzipped: ~150KB)
├─ Carga inicial: 2-3 segundos
├─ Interactividad: < 100ms
└─ Consumo memoria: 100-150MB

Backend (Python):
├─ Startup: 2-3 segundos
├─ Respuesta API: < 50ms
├─ Broadcast WebSocket: < 10ms
└─ Consumo memoria: 200-250MB

Total con SO:
├─ RPi4: ~500-600MB
└─ RPi3: ~700-800MB (con swap)
```

---

## 📈 TIMELINE Y MILESTONES

```
SEMANA 1: PREPARACIÓN Y BACKEND
═════════════════════════════════════════════════════════

Día 1: Análisis y preparación
├─ Leer documentación (2h)
├─ Crear rama git (0.5h)
└─ Backup del proyecto (0.5h)

Día 2-3: Modificación backend
├─ Agregar WebSocket (3h)
├─ Crear /api/config (2h)
├─ Testing backend (2h)
└─ Total: 7h

Día 4-5: Integración frontend base
├─ Crear cliente API (3h)
├─ Crear hooks (3h)
└─ Integración básica (2h)

Semana 1 total: ~20 horas ✓ HITO 1: Backend + Frontend básico


SEMANA 2: INTEGRACIÓN COMPLETA Y TESTING
═════════════════════════════════════════════════════════

Día 6: Integración completa
├─ Integrar componentes Kimi (3h)
├─ Ajustes y fixes (2h)
└─ Testing en dev (2h)

Día 7-8: Preparación RPi
├─ Flashear OS (1h)
├─ Instalar dependencias (2h)
├─ Configurar red (1h)
└─ Setup hardware (2h)

Día 9-10: Primeras pruebas RPi
├─ Deploy nativo/Docker (2h)
├─ Validación básica (2h)
├─ Fix de problemas (2h)
└─ Documentación (1h)

Semana 2 total: ~20 horas ✓ HITO 2: Funcionando en RPi


SEMANA 3: VALIDACIÓN EN LABORATORIO
═════════════════════════════════════════════════════════

Día 11-12: Pruebas con hardware
├─ Conexión fuente (1h)
├─ Conexión DAQ (1h)
├─ Conexión relés (1h)
├─ Pruebas integración (3h)
├─ Fixes (2h)
└─ Documentación (1h)

Día 13-14: Validación final
├─ Experimento de prueba (2h)
├─ Validación de datos (1h)
├─ Performance testing (2h)
├─ Documentación final (1h)
└─ Entrenamientodel equipo (1h)

Día 15: Handoff
├─ Revisión final (1h)
├─ Documentación (0.5h)
└─ Aprobación (0.5h)

Semana 3 total: ~17 horas ✓ HITO 3: Sistema validado en Lab


TOTAL: ~47 horas
═════════════════════════════════════════════════════════

MILESTONES PRINCIPALES:

✓ Semana 1: Backend funciona con WebSocket
✓ Semana 2: Sistema completo corre en RPi
✓ Semana 3: Validado con hardware real en laboratorio
✓ Final: Documentación completa + Equipo capacitado
```

---

## 🎓 MATRIZ DE CAPACITACIÓN

```
Antes de usar el sistema en experimentos:

OPERADORES DE LABORATORIO:
├─ Interfaz web: 1 hora
├─ Control de fuente: 1 hora
├─ Lectura de datos: 0.5 horas
├─ Alertas y seguridad: 1 hora
├─ Grabación de datos: 0.5 horas
└─ Total: 4 horas

INGENIEROS/TÉCNICOS:
├─ Arquitectura del sistema: 2 horas
├─ API REST y WebSocket: 1.5 horas
├─ Troubleshooting: 2 horas
├─ Mantenimiento: 1 hora
├─ Actualizaciones: 1 hora
└─ Total: 7.5 horas

ADMINISTRADOR DEL SISTEMA:
├─ Instalación/despliegue: 2 horas
├─ Configuración hardware: 1.5 horas
├─ Monitoreo del sistema: 1 hora
├─ Backups y recuperación: 1 hour
├─ Actualizaciones de SO: 1 hora
└─ Total: 6.5 horas
```

---

## 🔗 DEPENDENCIAS Y VERSIONES

```
RECOMENDADAS PARA RASPBERRY PI 4:

Kernel:
└─ Linux 5.15+ (Bookworm tiene 6.x)

Python:
├─ Python 3.11 (3.10 también funciona)
├─ Flask 3.0.0
├─ flask-socketio 5.3.5
├─ RPi.GPIO 0.7.1
└─ mcculw 2.3.1

Node.js:
├─ Node 20 LTS (18 también funciona)
├─ npm 10+
├─ React 18.3+
├─ Vite 5.4+
└─ TailwindCSS 3.4+

Sistema operativo:
├─ Raspberry Pi OS Bookworm 64-bit (recomendado)
├─ o Debian 12 (compatible)
└─ 4GB RAM mínimo (8GB recomendado)

Drivers específicos:
├─ MCC Linux DAQ driver (de fabricante)
├─ libusb 1.0
└─ librpi-gpio
```

---

## 📊 MATRIZ DE DECISIÓN: RPi3 vs RPi4

```
┌────────────────┬──────────────────┬──────────────────┐
│   ASPECTO      │      RPi3        │      RPi4        │
├────────────────┼──────────────────┼──────────────────┤
│ CPU            │ 1.4GHz ARM7      │ 1.5GHz ARM8 x4   │
│ RAM            │ 1GB              │ 4GB (recom)      │
│ USB 3.0        │ No               │ Sí               │
│ Ethernet       │ 100Mbps          │ Gigabit          │
│                │                  │                  │
│ Precio         │ ~$35             │ ~$55             │
│ Disponibilidad │ Buena            │ Muy buena        │
│                │                  │                  │
│ LabPiPanel     │ Funciona*        │ Funciona bien    │
│ Performance    │ 60% CPU pico     │ 40% CPU normal   │
│ RAM uso        │ 600-700MB swap   │ 300-400MB        │
│ Temperatura    │ 70°C pico        │ 50°C pico        │
│                │                  │                  │
│ Recom. para... │ Testing básico   │ Producción       │
│                │ Desarrollo       │ Laboratorio      │
│                │                  │                  │
│ Consideración  │ * Requiere:      │ Óptimo           │
│                │ - Aumentar swap  │ Mínimas tweaks   │
│                │ - Optimizar App  │ Plug & play      │
│                │ - Monitoreo temp │ Confiable        │
└────────────────┴──────────────────┴──────────────────┘

RECOMENDACIÓN: Usar RPi4 para producción en laboratorio.
RPi3 es válido para desarrollo y testing.
```

---

## ✅ CHECKLIST PRE-IMPLEMENTACIÓN

Antes de comenzar, asegurate de que:

- [ ] Tienes acceso a la URL de Kimi con el código fuente
- [ ] Repositorio está actualizado: `git pull`
- [ ] Tienes Raspberry Pi física disponible
- [ ] Tienes acceso SSH a la RPi (o puerto serie)
- [ ] Tienes una microSD 32GB+ con lector
- [ ] Git está configurado: `git config --global user.name`
- [ ] Python 3.11+ instalado en tu máquina
- [ ] Node 18+ instalado en tu máquina
- [ ] Docker instalado (si usas Docker)
- [ ] Hardware conectado (fuente, DAQ, relés) ✓ Configurado
- [ ] Has leído los documentos: Resumen + Reporte + Checklist
- [ ] Tienes 3 semanas de tiempo disponible
- [ ] Equipo de lab está preparado para pruebas

---

## 🎯 DEFINICIÓN DE ÉXITO

El proyecto es exitoso cuando:

**Funcional:**
1. ✅ Frontend Kimi carga sin errores
2. ✅ WebSocket conecta a backend
3. ✅ Datos en vivo se actualizan < 200ms
4. ✅ Control de fuente responde < 1s
5. ✅ CSV se graba correctamente

**Seguridad:**
6. ✅ Validaciones activas en frontend y backend
7. ✅ Alertas se disparan para condiciones peligrosas
8. ✅ No hay acceso no autorizado

**Rendimiento:**
9. ✅ CPU < 50% en RPi4
10. ✅ RAM < 512MB en operación normal
11. ✅ Frontend carga < 3 segundos

**Confiabilidad:**
12. ✅ Uptime > 48 horas sin problemas
13. ✅ Reconexión automática ante fallos
14. ✅ Logs registran todos los eventos

**Documentación:**
15. ✅ README actualizado
16. ✅ API documentada
17. ✅ Scripts de despliegue funcionan
18. ✅ Equipo capacitado

---

**Documento complementario v1.0**  
**Generado: 4 de febrero de 2026**  
**Instituto Tecnológico Metropolitano (ITM)**
