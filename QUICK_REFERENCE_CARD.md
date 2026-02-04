# QUICK REFERENCE: TARJETA DE REFERENCIA RÁPIDA

**LabPiPanel Kimi Integration**  
**Guía de bolsillo para desarrolladores**

---

## 🎯 OBJETIVO

Integrar frontend Kimi (mejor UX + gráficos) sin romper backend actual.

---

## 📋 TAREAS PRINCIPALES

### Backend (Python)

```bash
# 1. Agregar imports
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# 2. Habilitar CORS y WebSocket
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 3. Crear endpoint /api/config
@app.route('/api/config', methods=['GET', 'POST'])

# 4. Agregar WebSocket handlers
@socketio.on('connect')
@socketio.on('disconnect')
@socketio.on('request_live_data')

# 5. Crear thread de broadcast
def broadcast_live_data():
    while True:
        socketio.emit('live_data', data)
        time.sleep(0.1)

# 6. Cambiar main
socketio.run(app, host='0.0.0.0', port=5000)
```

### Frontend (TypeScript)

```typescript
// 1. Crear client API
src/utils/apiClient.ts

// 2. Crear hook WebSocket
src/hooks/useLiveData.ts

// 3. Crear hook control
src/hooks/useFuenteControl.ts

// 4. Crear .env.local
VITE_API_URL=http://localhost:5000/api

// 5. Integrar componentes Kimi
src/components/[componentes Kimi]

// 6. Actualizar App.tsx
Reemplazar estado simulado por datos reales
```

---

## 📦 DEPENDENCIAS A AGREGAR

```bash
# Backend
pip install flask-cors flask-socketio python-socketio

# Frontend
npm install socket.io-client

# Optional: Gráficos mejorados
npm install recharts
```

---

## 🔧 ARCHIVOS A CREAR

```
BACKEND:
├─ config/system.json          (Config persistente)

FRONTEND:
├─ src/utils/apiClient.ts      (Cliente HTTP)
├─ src/utils/apiClient.test.ts (Tests - opcional)
├─ src/hooks/useLiveData.ts    (Hook WebSocket)
├─ src/hooks/useFuenteControl.ts (Hook control)
├─ .env.local                  (Env variables)

SCRIPTS:
├─ scripts/setup-rpi.sh        (Setup completo)
├─ scripts/deploy-native.sh    (Deploy sin Docker)
├─ scripts/deploy-docker.sh    (Deploy con Docker)

CONFIG:
├─ /etc/nginx/sites-available/labpipanel (Nginx)
├─ /etc/systemd/system/labpipanel.service (Systemd)

DOCS:
├─ DEPLOYMENT.md               (Guía despliegue)
├─ API_UPDATED.md             (API endpoints)
└─ TROUBLESHOOTING.md         (Problemas comunes)
```

---

## 🚀 WORKFLOW GIT

```bash
# 1. Crear rama
git checkout -b feat/integrate-kimi-frontend

# 2. Backup
git tag backup-bolt-before-kimi

# 3. Commits
git add .
git commit -m "feat: Add WebSocket support"
git commit -m "feat: Integrate Kimi frontend"
git commit -m "docs: Update API documentation"

# 4. Push y PR
git push origin feat/integrate-kimi-frontend
# Crear pull request en GitHub

# 5. Merge
git checkout main
git merge feat/integrate-kimi-frontend
git tag v1.1.0-kimi-integration
```

---

## 🧪 TESTING CHECKLIST

### Backend

```bash
curl http://localhost:5000/api/status
curl http://localhost:5000/api/config
curl -X POST http://localhost:5000/api/fuente/voltage -d '{"voltage":150}'
```

### Frontend

```bash
npm run dev  # Vite dev server
npm run build # Production build
npm run lint  # Check code
```

### WebSocket

```python
# Test WebSocket
from socketio import Client
sio = Client()
sio.connect('http://localhost:5000')
sio.emit('request_live_data')
@sio.on('live_data')
def on_data(data):
    print(data)
```

---

## 📊 API ENDPOINTS

```
GET  /api/status              → Estado general
GET  /api/config              → Configuración actual
POST /api/config              → Guardar configuración
POST /api/fuente/voltage      → Configurar voltaje
POST /api/fuente/current      → Configurar corriente
POST /api/fuente/output       → ON/OFF
POST /api/relay/1-4           → Control relés
POST /api/recording/start     → Grabar
POST /api/recording/stop      → Parar grabación

WebSocket:
emit 'request_live_data'      → Iniciar stream
emit 'stop_live_data'         → Parar stream
on   'live_data'              → Recibir datos (100ms)
on   'alert'                  → Recibir alerta
```

---

## 🌐 ENVIRONMENT VARIABLES

```env
# Backend (.env)
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
XLN_HOST=192.168.1.100
XLN_PORT=5024

# Frontend (.env.local)
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=http://localhost:5000
VITE_ENVIRONMENT=development
```

---

## 🐛 DEBUGGING

```bash
# Backend logs
tail -f logs/labpipanel.log

# Frontend console
F12 → Console → Network

# WebSocket debug
# En Flask: socketio.init_app(app, debug=True)

# GPIO test
gpio readall
gpio mode 1 out
gpio write 1 1

# DAQ test
python3 -c "from mcculw import ul; print(ul.get_device_list())"

# Telnet test
telnet 192.168.1.100 5024
*IDN?
```

---

## 🔑 VARIABLES DE SEGURIDAD

```python
# config.py
SAFETY_LIMITS = {
    'XLN_VOLTAGE_MAX': 280,      # < 300V
    'XLN_CURRENT_MAX': 5.0,      # < 5.2A
    'XLN_POWER_MAX': 1400,       # < 1500W
    'TEMP_ALARM_HIGH': 120.0,    # °C
    'TEMP_ALARM_LOW': -40.0,     # °C
    'WATCHDOG_TIMEOUT': 30,      # segundos
}
```

---

## 📈 PERFORMANCE TARGETS

```
Frontend:
├─ Bundle size: < 500KB
├─ Gzip: < 150KB
├─ Load time: < 3 segundos
└─ Memory: < 150MB

Backend:
├─ API response: < 50ms
├─ WebSocket latency: < 100ms
├─ Memory: < 250MB
└─ CPU: < 50% (RPi4)

Total (RPi4):
├─ RAM: < 512MB
├─ CPU: < 50%
├─ Temp: < 60°C
└─ Uptime: > 48h
```

---

## 🛠️ COMÚN ISSUES

| Problema | Solución |
|----------|----------|
| WebSocket no conecta | Verificar CORS habilitado |
| API 404 | Verificar rutas en Flask |
| GPIO no responde | Verificar permisos: `sudo usermod -aG gpio pi` |
| Alto uso CPU | Reducir sample rate o puntos de datos |
| DAQ desconectado | Instalar drivers MCC Linux |
| Fuente Telnet error | Verificar IP: `ping 192.168.1.100` |

---

## 📞 CONTACTOS RÁPIDOS

**Documentación:**
- REPORTE_INTEGRACION_FRONTEND_KIMI.md (Técnico)
- CHECKLIST_INTEGRACION_KIMI.md (Operativo)
- GUIA_CODIGO_STARTER_KIMI.md (Código)

**Hardware Manual:**
- Fuente XLN30052: [Manual]
- DAQ USB-5203: [Manual]
- RPi GPIO: pinout.xyz

**Software Help:**
- Flask: flask.palletsprojects.com
- Socket.io: socket.io/docs
- React: react.dev

---

## ⏱️ ESTIMADOS

| Tarea | Tiempo |
|-------|--------|
| Backend WebSocket | 3h |
| Frontend cliente API | 3h |
| Frontend hooks | 2h |
| Integración componentes | 4h |
| Testing | 4h |
| Deploy RPi | 3h |
| Validación hardware | 4h |
| **TOTAL** | **23h** |

---

## ✅ SIGN-OFF CHECKLIST

Antes de considerar "hecho":

- [ ] Backend pasa todos los tests
- [ ] Frontend pasa todos los tests
- [ ] WebSocket funciona en tiempo real
- [ ] CSV se graba correctamente
- [ ] Funciona en RPi4
- [ ] Documentación actualizada
- [ ] Equipo está capacitado
- [ ] Sistema validado en lab
- [ ] Codigo mergeado a main
- [ ] Tag creado en git

---

## 📱 QUICK COMMANDS

```bash
# Development
python labpipanel.py              # Backend
npm run dev                        # Frontend

# Build
npm run build                      # Frontend prod

# Deploy
./scripts/setup-rpi.sh            # Setup RPi
./scripts/deploy-native.sh        # Deploy en RPi

# Monitor
journalctl -u labpipanel -f       # Backend logs
docker logs -f labpipanel         # Docker logs
htop                              # System monitor

# Git
git status                        # Ver cambios
git diff                          # Ver diferencias
git log --oneline -10             # Ver commits
git push                          # Enviar cambios
```

---

## 🎓 LEARNING CURVE

Para nuevo developer en el proyecto:

1. **Día 1:** 
   - Lee resumen ejecutivo (1h)
   - Entiende arquitectura actual (2h)
   
2. **Día 2-3:**
   - Lee reporte técnico (3h)
   - Explora código existente (3h)
   
3. **Día 4+:**
   - Comienza con tasks pequeñas
   - Usa checklist como guía
   - Pregunta cuando dudes

**Tiempo estimado para ser productivo: 1 semana**

---

## 🚦 STATUS TRACKING

```
SPRINT 1:
├─ [ ] Backend WebSocket          (Est: 3h)
├─ [ ] Frontend API client        (Est: 3h)
├─ [ ] Frontend hooks             (Est: 2h)
└─ [ ] Testing local              (Est: 2h)

SPRINT 2:
├─ [ ] Integración componentes    (Est: 4h)
├─ [ ] Deploy RPi                 (Est: 3h)
├─ [ ] Testing RPi                (Est: 2h)
└─ [ ] Documentación              (Est: 2h)

SPRINT 3:
├─ [ ] Validación laboratorio     (Est: 4h)
├─ [ ] Finales fixes              (Est: 2h)
├─ [ ] Capacitación equipo        (Est: 1h)
└─ [ ] Sign-off                   (Est: 1h)
```

---

**Referencia rápida v1.0 - 4 febrero 2026**  
**Imprimir o marcar como favorito para acceso rápido**
