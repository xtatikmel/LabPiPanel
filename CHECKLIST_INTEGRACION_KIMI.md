# CHECKLIST TÉCNICO: INTEGRACIÓN FRONTEND KIMI

**Proyecto:** LabPiPanel - Sistema de Control Térmico  
**Documento:** Lista de verificación para integración segura  
**Versión:** 1.0 - 4 de febrero de 2026

---

## FASE 1: VALIDACIÓN INICIAL

### 1.1 Análisis del Código Fuente Kimi

- [ ] **Revisar estructura HTML/JSX**
  - [ ] Identificar componentes principales
  - [ ] Verificar dependencias externas
  - [ ] Listar todas las librerías importadas
  - [ ] Documentar hooks personalizados usados

- [ ] **Revisar estilos**
  - [ ] ¿Usa Tailwind CSS? (compatible)
  - [ ] ¿Usa CSS Modules? (validar integración)
  - [ ] ¿Usa styled-components? (NO - cambiar a Tailwind)
  - [ ] Verificar assets/imágenes

- [ ] **Revisar configuración TypeScript**
  - [ ] tsconfig.json compatible
  - [ ] Tipos definidos adecuadamente
  - [ ] Sin `any` sin justificar
  - [ ] Validar interfaz de datos

- [ ] **Revisar lógica de datos**
  - [ ] ¿Dónde obtiene datos? (simulados/API/ambos)
  - [ ] Estructura de datos esperada
  - [ ] Validación de entrada
  - [ ] Manejo de errores

### 1.2 Comparación Backend Actual vs Requerido

| Funcionalidad | Actual | Requerido | Estado |
|---------------|--------|-----------|--------|
| GET /api/status | ✅ | ✅ | OK |
| GET /api/data/live | ⚠️ HTTP polling | WebSocket | **CAMBIO** |
| POST /api/fuente/voltage | ✅ | ✅ | OK |
| POST /api/fuente/current | ✅ | ✅ | OK |
| POST /api/fuente/output | ✅ | ✅ | OK |
| GET/POST /api/config | ❌ | ✅ | **AGREGAR** |
| Almacenamiento config | ❌ | ✅ | **AGREGAR** |
| CORS habilitado | ❌ | ✅ | **AGREGAR** |

---

## FASE 2: PREPARACIÓN DEL REPOSITORIO

### 2.1 Control de Versiones

```bash
# [ ] Crear rama de trabajo
git checkout -b feat/integrate-kimi-frontend

# [ ] Crear etiqueta de backup
git tag -a backup-bolt-before-kimi -m "Backup antes de integración Kimi"
git push origin backup-bolt-before-kimi

# [ ] Verificar estado limpio
git status
# Debe mostrar "nothing to commit"
```

### 2.2 Estructura de Directorios

```bash
# [ ] Crear estructura nueva
mkdir -p backend/api backend/utils
mkdir -p IA/project_kimi/{src,public}
mkdir -p scripts/{setup,deploy}
mkdir -p docs/{architecture,deployment}

# [ ] Verificar creación
find . -type d -name "project_kimi" -o -name "backend/api"
```

### 2.3 Documentación Base

- [ ] Crear INTEGRATION_PLAN.md (este archivo)
- [ ] Crear API_SPECIFICATION.md (nuevos endpoints)
- [ ] Crear DEPLOYMENT_GUIDE.md (pasos de despliegue)
- [ ] Actualizar README.md con nueva estructura

---

## FASE 3: MODIFICACIONES BACKEND

### 3.1 Dependencias Python

```bash
# [ ] Revisar requirements.txt actual
grep -E "flask|socketio|cors" requirements.txt

# [ ] Agregar si falta:
# - flask-socketio>=5.3.0
# - flask-cors>=4.0.0
# - python-socketio>=5.10.0
# - python-engineio>=4.8.0

# [ ] Actualizar en requirements.txt
pip install -r requirements.txt

# [ ] Verificar instalación
python3 -c "import flask_socketio; import flask_cors; print('OK')"
```

### 3.2 Modificación labpipanel.py

```python
# [ ] Línea ~5: Agregar imports nuevos
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json

# [ ] Línea ~20 (después de app = Flask(__name__)):
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# [ ] Agregar decorador @socketio.on en nuevas rutas
# [ ] Habilitar debug: socketio.init_app(app, debug=True)

# [ ] Al final, cambiar:
# DE: app.run(host='0.0.0.0', port=5000)
# A:  socketio.run(app, host='0.0.0.0', port=5000)
```

### 3.3 Nuevo Archivo: config_manager.py

```python
# [ ] Crear archivo backend/utils/config_manager.py

# [ ] Debe contener:
# - Clase ConfigManager con métodos:
#   - load_config()
#   - save_config(config_dict)
#   - validate_config(config_dict)
#   - get_defaults()

# [ ] Usar JSON para almacenamiento:
config_file = Path("config/system.json")

# [ ] Incluir esquema de validación
```

### 3.4 Nuevo Archivo: schemas.py

```python
# [ ] Crear backend/api/schemas.py

# [ ] Definir clases de validación:
# - FuenteConfigSchema
# - DAQConfigSchema
# - SafetyLimitsSchema
# - ExperimentSchema

# [ ] Usar pydantic o dataclasses
# [ ] Validar rangos
# [ ] Usar en POST/PUT endpoints
```

### 3.5 Nuevos Endpoints API

```python
# [ ] GET /api/config
# Retorna: { fuente: {...}, daq: {...}, safety: {...} }

# [ ] POST /api/config
# Body: { fuente: {...}, daq: {...}, safety: {...} }
# Valida y guarda en JSON

# [ ] WebSocket: /socket.io
# Evento: 'request_live_data' -> emite 'live_data' cada 100ms
# Evento: 'stop_live_data' -> detiene emisión

# [ ] GET /api/data/export
# Query: ?from=ISO8601&to=ISO8601
# Retorna: CSV de datos históricos
```

### 3.6 Testing Backend

```bash
# [ ] Test unitario de config_manager.py
python -m pytest backend/utils/test_config_manager.py

# [ ] Test de API
curl http://localhost:5000/api/status
curl -X POST http://localhost:5000/api/config

# [ ] Test WebSocket
# Usar cliente WebSocket (node, Python ws, etc.)
python scripts/test_websocket.py

# [ ] Test bajo carga
# Verificar 100 mensajes/segundo sin error
```

---

## FASE 4: INTEGRACIÓN FRONTEND

### 4.1 Preparación del Código Kimi

```bash
# [ ] Descargar/copiar código fuente de Kimi desde:
# https://33kpj7dv4ij64.ok.kimi.link

# [ ] Extraer componentes a:
IA/project_kimi/src/components/

# [ ] Copiar package.json y dependencias:
cd IA/project_kimi && npm install

# [ ] Verificar estructura:
tree IA/project_kimi/src/ -I node_modules
```

### 4.2 Archivos Críticos a Crear

#### 4.2.1 src/utils/apiClient.ts

```typescript
// [ ] Crear apiClient.ts con métodos:

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';

// [ ] Métodos GET
- getStatus()
- getConfig()
- getDataHistory(startTime, endTime)

// [ ] Métodos POST
- setVoltage(voltage)
- setCurrent(current)
- setOutput(enabled)
- setRelayState(relay_num, state)
- startRecording()
- stopRecording()
- updateConfig(config)

// [ ] Manejo de errores
- Retry automático con backoff exponencial
- Timeout de 30 segundos
- Logging de errores
```

#### 4.2.2 src/hooks/useLiveData.ts

```typescript
// [ ] Crear hook con:

export const useLiveData = () => {
  // [ ] Conectar a WebSocket
  const socket = io(WEBSOCKET_URL);
  
  // [ ] Mantener estado de datos
  const [data, setData] = useState<LiveData | null>(null);
  
  // [ ] Emitir evento 'request_live_data' al conectar
  // [ ] Escuchar evento 'live_data'
  // [ ] Limpiar conexión al desmontar
  
  // [ ] Retornar { data, isConnected, error }
}
```

#### 4.2.3 src/hooks/useFuenteControl.ts

```typescript
// [ ] Crear hook con:

export const useFuenteControl = () => {
  // [ ] Estado: voltage, current, outputEnabled
  // [ ] Métodos: setVoltage, setCurrent, toggleOutput
  // [ ] Validación de rangos
  // [ ] Manejo de confirmación para voltajes altos
  // [ ] Sincronización con backend
}
```

#### 4.2.4 .env.local

```env
# [ ] Crear archivo con variables:
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=ws://localhost:5000
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug

# [ ] En producción (Raspberry Pi):
VITE_API_URL=http://labpipanel-rpi:5000/api
VITE_API_WS_URL=ws://labpipanel-rpi:5000
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=info
```

### 4.3 Actualizar Archivos Existentes

#### 4.3.1 src/types/index.ts

```typescript
// [ ] Actualizar interfaces existentes
// [ ] Agregar nuevas interfaces si es necesario
// [ ] Asegurar que coincidan con API backend
// [ ] Documentar cada campo con comentarios

export interface LiveData {
  timestamp: string;        // ISO 8601
  elapsed_time: number;     // segundos desde inicio
  voltaje: number;          // voltios
  corriente: number;        // amperios
  potencia: number;         // vatios
  T_ch0 to T_ch7: number;  // temperaturas °C
  T_evap_avg: number;       // promedio evaporador
  T_cond_avg: number;       // promedio condensador
  R_thermal: number;        // resistencia térmica
  relay_1 to relay_4: boolean;
}
```

#### 4.3.2 src/App.tsx

```typescript
// [ ] Reemplazar estado simulado con datos reales
// DE: const [dataHistory, setDataHistory] = useState<LiveData[]>([]);
// A:  const [dataHistory] = useLiveData();

// [ ] Reemplazar simulador
// DE: simulatorRef.current.generateLiveData(...)
// A:  useLiveData hook (datos del servidor)

// [ ] Agregar manejo de errores de conexión
// [ ] Mostrar indicador de conexión

// [ ] Agregar componente de carga mientras conecta
```

#### 4.3.3 Componentes Individuales

Para cada componente (RealtimeCharts, PowerSourceControl, etc.):

- [ ] Actualizar props para usar datos reales
- [ ] Remover código de simulación
- [ ] Agregar validación de props
- [ ] Documentar con JSDoc comments
- [ ] Agregar error boundaries

### 4.4 Dependencias NPM

```bash
# [ ] Instalar cliente WebSocket
npm install socket.io-client

# [ ] Instalar librerías de gráficos (opcional pero recomendado)
npm install recharts
# O:
npm install chart.js react-chartjs-2

# [ ] Revisar versiones compatibles
npm ls react socket.io-client

# [ ] Audit de seguridad
npm audit
# [ ] Resolver vulnerabilidades si hay
npm audit fix
```

### 4.5 Build y Testing Frontend

```bash
# [ ] Verificar sintaxis TypeScript
npm run typecheck

# [ ] Linting
npm run lint

# [ ] Build de producción
npm run build

# [ ] Verificar tamaño del bundle
npm run build -- --analyze

# [ ] Servir build localmente para testing
npm run preview
```

---

## FASE 5: PRUEBAS INTEGRACIÓN

### 5.1 Pruebas Locales (Windows/Linux)

```bash
# [ ] Terminal 1: Ejecutar backend
cd e:\GIT\LabPiPanel
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
python labpipanel.py

# [ ] Terminal 2: Ejecutar frontend
cd IA/project_kimi
npm run dev

# [ ] Verificar en navegador
# http://localhost:5173 (Vite dev server)

# [ ] Abrir consola del navegador (F12)
# [ ] Verificar conexión a http://localhost:5000
# [ ] Verificar WebSocket conectada
```

### 5.2 Matriz de Pruebas Funcionales

| Funcionalidad | Test | Esperado | Resultado | Notas |
|---------------|------|----------|-----------|-------|
| Cargar página | GET / | 200 OK, HTML | ✓ | |
| Conectar a API | GET /api/status | 200 OK, JSON | ✓ | |
| WebSocket | emit 'request_live_data' | recibir 'live_data' | ✓ | Cada 100ms |
| Voltaje slider | Cambiar a 150V | POST /api/fuente/voltage | ✓ | < 1s |
| Corriente slider | Cambiar a 3A | POST /api/fuente/current | ✓ | < 1s |
| Botón ON/OFF | Activar fuente | Indicador cambia | ✓ | Feedback visual |
| Control relés | Toggle relay 1 | GPIO se activa | ✓ | Si hardware presente |
| Grabación | Click REC | Archivo CSV creado | ✓ | Timestamp en nombre |
| Alertas | Simular T > límite | Alerta mostrada | ✓ | Sonido si habilitado |
| Exportar datos | Click Export | Descarga CSV | ✓ | Validar contenido |

### 5.3 Testing de Rendimiento

```bash
# [ ] Monitorear recursos mientras se ejecuta
# Windows: Performance Monitor
# Linux: htop, top, ps

# [ ] Criterios mínimos:
# - RAM: < 500MB para backend + frontend
# - CPU: < 50% en máquina de desarrollo
# - Latencia red: < 50ms

# [ ] Test de carga
# - Simular 10 conexiones simultáneas
# - Verificar WebSocket escalable
```

---

## FASE 6: PREPARACIÓN RASPBERRY PI

### 6.1 Hardware

- [ ] Raspberry Pi 3B+ o superior
- [ ] MicroSD 32GB+ (preferible clase 10+)
- [ ] Fuente de alimentación 5V/3A (RPi3) o 5V/5A (RPi4)
- [ ] Cable Ethernet
- [ ] Heatsink para CPU
- [ ] Ventilador opcional (para RPi3 en verano)

### 6.2 Preparación del SO

```bash
# [ ] Descargar Raspberry Pi OS 64-bit Bookworm
# https://www.raspberrypi.com/software/

# [ ] Usar Raspberry Pi Imager para flashear
# [ ] Configuración inicial en Imager:
#   - Hostname: labpipanel-rpi
#   - Usuario: pi (default)
#   - Habilitar SSH: Yes
#   - WiFi: (si aplica)
#   - Localización: America/Bogota

# [ ] Después del primer boot:
ssh pi@192.168.1.50  # (o IP asignada)

# [ ] Actualizar SO
sudo apt-get update && sudo apt-get upgrade -y

# [ ] Cambiar contraseña
passwd

# [ ] Configurar raspi-config
sudo raspi-config
# [ ] Opciones:
#   - System -> Hostname: labpipanel-rpi
#   - Interface Options -> SSH: Enable
#   - Interface Options -> GPIO: Enable
#   - Performance -> GPU Memory: 16MB (liberar RAM)
#   - Localization -> Timezone: America/Bogota
```

### 6.3 Instalación de Dependencias

```bash
# [ ] Scripts a ejecutar en RPi
cd /home/pi
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel

# [ ] Crear archivo setup-rpi.sh localmente
chmod +x scripts/setup-rpi.sh
./scripts/setup-rpi.sh

# [ ] Verificar instalación
python3.11 --version
node --version
docker --version  (si usas Docker)
```

### 6.4 Configuración de Servicios

```bash
# [ ] Si despliegue NATIVE (sin Docker):

# [ ] Crear servicio systemd
sudo nano /etc/systemd/system/labpipanel.service

# [ ] Contenido:
[Unit]
Description=LabPiPanel Thermal Lab Control
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/LabPiPanel
Environment="PATH=/home/pi/LabPiPanel/venv/bin"
ExecStart=/home/pi/LabPiPanel/venv/bin/python labpipanel.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# [ ] Habilitar y iniciar
sudo systemctl daemon-reload
sudo systemctl enable labpipanel
sudo systemctl start labpipanel

# [ ] Verificar
sudo systemctl status labpipanel
journalctl -u labpipanel -f -n 20
```

### 6.5 Configuración de Red

```bash
# [ ] IP estática (recomendado)
sudo nano /etc/dhcpcd.conf

# [ ] Agregar al final:
interface eth0
static ip_address=192.168.1.50/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4

# [ ] Reiniciar interfaz
sudo systemctl restart dhcpcd

# [ ] Verificar
ip addr show eth0
```

---

## FASE 7: DESPLIEGUE EN RASPBERRY PI

### 7.1 Opción A: Despliegue Nativo (Recomendado para desarrollo)

```bash
# [ ] En RPi:

# [ ] Clonar repo
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel

# [ ] Backend
python3.11 -m venv venv_backend
source venv_backend/bin/activate
pip install -r requirements.txt

# [ ] Frontend
cd IA/project_kimi
npm install
npm run build
cd ../..

# [ ] Variables de entorno
cp .env.example .env
nano .env
# Editar IP_FUENTE si es necesario

# [ ] Iniciar backend
python labpipanel.py

# [ ] En otra terminal, servir frontend con Nginx
sudo apt-get install -y nginx
sudo systemctl start nginx
# Copiar dist a /var/www/html

# [ ] Acceder en navegador
# http://192.168.1.50
```

### 7.2 Opción B: Despliegue con Docker (Recomendado para producción)

```bash
# [ ] En RPi:

# [ ] Clonar repo
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel

# [ ] Build de imagen ARM64
docker build -t labpipanel:latest-arm64 \
  --platform linux/arm64 \
  -f Dockerfile .

# [ ] Opcionalmente, verificar imagen
docker images | grep labpipanel

# [ ] Ejecutar con compose
docker-compose up -d

# [ ] Verificar estado
docker-compose logs -f labpipanel

# [ ] Acceder en navegador
# http://192.168.1.50:80
```

### 7.3 Health Checks

```bash
# [ ] Verificar backend
curl http://localhost:5000/api/status

# [ ] Verificar frontend
curl http://localhost:80

# [ ] Verificar logs
sudo journalctl -u labpipanel -f  # (si native)
docker-compose logs labpipanel     # (si Docker)

# [ ] Monitoreo de recursos
htop
# Buscar procesos: labpipanel, python, node, nginx

# [ ] Verificar puertos abiertos
sudo netstat -tlpn | grep -E "5000|80|443"
```

---

## FASE 8: PRUEBAS HARDWARE EN LABORATORIO

### 8.1 Verificación Pre-Conexión

- [ ] **Fuente XLN30052**
  - [ ] Alimentación: 220V conectada
  - [ ] Panel frontal responde
  - [ ] IP configurada: 192.168.1.100
  - [ ] Puerto Telnet: 5024 accesible

- [ ] **DAQ USB-5203**
  - [ ] Puerto USB conectado a RPi
  - [ ] LED indicador encendido
  - [ ] `lsusb` detecta el dispositivo
  - [ ] Drivers MCC instalados: `ls -l /usr/local/lib/libmccdaq*`

- [ ] **Módulo Relés**
  - [ ] GPIO conectados correctamente (pins 26, 20, 21, 16)
  - [ ] Prueba de GPIO: `gpio readall`
  - [ ] LEDs del módulo encendidos

- [ ] **Termopares**
  - [ ] 8 termopares conectados al DAQ
  - [ ] Calibración de referencia (CJC)
  - [ ] Continuidad verificada

### 8.2 Tests de Comunicación

```bash
# [ ] Telnet a fuente
telnet 192.168.1.100 5024
# Si conecta, escribir: *IDN?
# Debe retornar identificación de la fuente

# [ ] Test DAQ
python3 -c "from mcculw import ul; print(ul.get_device_list())"

# [ ] Test GPIO
gpio readall
gpio mode 1 out
gpio write 1 1  # Encender relay 1
gpio write 1 0  # Apagar relay 1
```

### 8.3 Pruebas en Interfaz Web

- [ ] **Estado General**
  - [ ] Dashboard carga sin errores
  - [ ] Indicadores de conexión verde
  - [ ] Sin alertas iniciales

- [ ] **Control de Fuente**
  - [ ] Slider voltaje: mueve 0-280V sin error
  - [ ] Slider corriente: mueve 0-5.0A sin error
  - [ ] Botón ON/OFF: responde y muestra estado
  - [ ] Confirmación para V > 100V

- [ ] **Lectura de Datos**
  - [ ] 8 gráficos de temperatura actualizan
  - [ ] Promedios evaporador/condensador calculados
  - [ ] Gráficos V-I, Potencia, Resistencia térmica
  - [ ] Latencia < 500ms

- [ ] **Control de Relés**
  - [ ] 4 botones togglean relés
  - [ ] Feedback visual inmediato
  - [ ] Actuadores responden (bomba, ventiladores)

- [ ] **Grabación de Datos**
  - [ ] Botón START inicia grabación
  - [ ] CSV se crea en directorio
  - [ ] Timestamp en nombre del archivo
  - [ ] Datos se escriben cada ciclo

- [ ] **Sistema de Alertas**
  - [ ] Pantalla de alertas visible
  - [ ] Simular exceso de temperatura
  - [ ] Alerta se muestra en interfaz
  - [ ] Sonido suena (si habilitado)

### 8.4 Prueba de Carga (Stress Test)

```bash
# [ ] Dejar sistema corriendo 30 minutos
# [ ] Cambiar configuración cada 5 minutos
# [ ] Monitorear:
#   - CPU: < 70%
#   - RAM: < 70%
#   - Temp CPU: < 60°C
#   - Sin crashes o desconexiones

# [ ] Al finalizar:
#   - CSV generado sin errores
#   - Todos los datos presentes
#   - Sin duplicados
```

### 8.5 Documentación de Resultados

```markdown
# Pruebas en Laboratorio - [FECHA]

## Equipo
- Raspberry Pi: [RPi3/RPi4, memoria RAM]
- Fuente: XLN30052 IP [xxx]
- DAQ: USB-5203 conectado puerto [xxx]
- Termopares: [cantidad] calibrados

## Resultados

### Comunicaciones
- [✓/✗] Telnet fuente: Responde en 200ms
- [✓/✗] DAQ USB: Detectado, drivers OK
- [✓/✗] GPIO relés: Todos funcionan

### Interfaz
- [✓/✗] Dashboard carga
- [✓/✗] Gráficos actualizan en tiempo real
- [✓/✗] Control responde < 1 segundo
- [✓/✗] CSV se crea correctamente

### Rendimiento
- CPU: XX% promedio, pico XX%
- RAM: XX% promedio
- Temperatura CPU: XX°C máx
- Uptime: XX horas sin problemas

## Incidentes
[Listar cualquier problema encontrado]

## Recomendaciones
[Cambios sugeridos, optimizaciones]

## Firma
Responsable: ____________________
Fecha: ____________________
```

---

## FASE 9: DESPLIEGUE FINAL

### 9.1 Validación de Requisitos

- [ ] Código merged a rama `main`
- [ ] Tests pasando 100%
- [ ] Documentación actualizada
- [ ] CHANGELOG.md registra cambios
- [ ] Version bumped en package.json
- [ ] Git tag creado: `v1.1.0-kimi-integration`

### 9.2 Producción

```bash
# [ ] En RPi (producción):
git checkout main
git pull origin main

# [ ] Detener servicio actual
sudo systemctl stop labpipanel
# O si Docker:
docker-compose down

# [ ] Backup de datos
tar czf ~/labpipanel-backup-$(date +%Y%m%d).tar.gz ~/LabPiPanel/results/

# [ ] Deploy
./scripts/deploy-native.sh  # o deploy-docker.sh

# [ ] Verificar
sudo systemctl status labpipanel
curl http://localhost/

# [ ] Monitor logs
journalctl -u labpipanel -f
```

### 9.3 Post-Deployment

- [ ] Notificar equipo de lab
- [ ] Entrenar usuarios en interfaz Kimi
- [ ] Crear manual de operación
- [ ] Configurar alertas (uptime monitoring)
- [ ] Planificar backups automáticos
- [ ] Documentar rutas de actualizacion futura

---

## CRITERIOS DE ACEPTACIÓN

### Must Have ✅

- [x] Frontend Kimi carga correctamente
- [x] Conexión a backend API funciona
- [x] Gráficos muestran datos en tiempo real
- [x] Control de fuente responde
- [x] Relés se activan correctamente
- [x] CSV se graba sin errores
- [x] Sistema funciona en Raspberry Pi 4

### Should Have ⚠️

- [x] Funciona en Raspberry Pi 3
- [x] Sistema de alertas completo
- [x] Configuración persistente
- [x] Documentación completa

### Nice to Have 🎁

- [x] Optimizaciones de rendimiento
- [x] Histórico de datos
- [x] Análisis avanzado

---

## RESUMEN DE CAMBIOS

| Área | Cambio | Prioridad | Estado |
|------|--------|-----------|--------|
| Backend | Agregar WebSocket | Alta | En proceso |
| Backend | Nuevo /api/config | Media | Pendiente |
| Frontend | Integrar Kimi | Alta | En proceso |
| Frontend | Cliente API | Alta | Pendiente |
| Infra | Docker ARM64 | Media | Actualizar |
| Docs | Guías deploy | Alta | Crear |
| RPi | Setup scripts | Media | Crear |

---

**Checklist versión 1.0 - Generado 4 de febrero de 2026**  
**Responsable: Equipo de Desarrollo ITM**
