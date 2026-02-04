# 🧪 TESTEO LOCAL PASO A PASO - EXPLICACIÓN DETALLADA

**Objetivo:** Ejecutar LabPiPanel en tu PC localmente para entender cómo funciona

> 📌 **Importante:** Vamos a ejecutar el código de `/IA/app` (Kimi integrado)  
> 🕐 **Tiempo estimado:** 30-45 minutos  
> 💻 **Requisitos:** Node.js 20+, Python 3.11+

---

## 🎯 VISIÓN GENERAL

### ¿Qué vamos a hacer?

```
1. Verificar requisitos (Node.js, Python)
2. Instalar dependencias del Frontend (npm)
3. Instalar dependencias del Backend (pip)
4. Iniciar Backend (puerto 5000)
5. Iniciar Frontend (puerto 5173)
6. Abrir navegador y validar
7. Explorar componentes en vivo
```

### ¿Por qué en este orden?

```
Backend primero → Frontend después

El frontend necesita que el backend esté corriendo para:
- Conectar por SSE (Server-Sent Events)
- Hacer llamadas a la API REST
- Recibir datos en tiempo real
```

---

## 📋 FASE 1: VERIFICACIÓN DE REQUISITOS

### Paso 1.1: Verificar Node.js

**¿Qué hace?** Verifica si tienes Node.js instalado

**¿Por qué?** El frontend React necesita Node.js para:
- `npm` (gestor de paquetes)
- `vite` (servidor de desarrollo)
- Compilar TypeScript

**Comando:**
```powershell
node --version
npm --version
```

**Resultado esperado:**
```
v20.x.x o superior
10.x.x o superior
```

**❌ Si no está instalado:**
```powershell
# Descarga desde: https://nodejs.org
# Instala la versión LTS (20.x)
# Reinicia PowerShell después
```

---

### Paso 1.2: Verificar Python

**¿Qué hace?** Verifica si tienes Python instalado

**¿Por qué?** El backend Flask necesita Python para:
- Ejecutar servidor Flask
- Controlar hardware (fuente, DAQ, GPIO)
- Procesar datos

**Comando:**
```powershell
python --version
```

**Resultado esperado:**
```
Python 3.11.x o 3.9+
```

**❌ Si no está instalado:**
```powershell
# Descarga desde: https://www.python.org
# Asegúrate de marcar "Add to PATH"
# Reinicia PowerShell después
```

---

### Paso 1.3: Ubicarte en el directorio correcto

**¿Qué hace?** Navega a la carpeta del proyecto Kimi

**¿Por qué?** Todos los comandos se ejecutan desde esta carpeta

**Comando:**
```powershell
cd E:\GIT\LabPiPanel\IA\app
```

**Verificar:**
```powershell
Get-Location  # Debe mostrar: E:\GIT\LabPiPanel\IA\app
```

---

## 📦 FASE 2: INSTALACIÓN DE DEPENDENCIAS FRONTEND

### Paso 2.1: Instalar dependencias Node.js

**¿Qué hace?** Lee `package.json` e instala todas las librerías necesarias

**¿Por qué?** El frontend necesita:
- React (UI framework)
- Vite (servidor de desarrollo)
- Chart.js (gráficas)
- Shadcn/ui (componentes)
- TypeScript (compilador)
- +40 dependencias más

**Comando:**
```powershell
npm install
```

**Lo que verás:**
```
added 450+ packages
audited 451 packages
found 0 vulnerabilities
```

**⏱️ Tiempo:** 2-5 minutos (descarga ~150 MB)

**📁 Resultado:** Crea carpeta `node_modules/` con todas las librerías

**¿Qué hace npm install exactamente?**
1. Lee `package.json` línea por línea
2. Descarga cada librería de npmjs.com
3. Descarga dependencias de esas librerías
4. Las guarda en `node_modules/`
5. Crea `package-lock.json` (versiones exactas)

---

### Paso 2.2: Verificar que se instaló correctamente

**Comando:**
```powershell
Test-Path node_modules\react  # Debe retornar True
```

**También puedes ver:**
```powershell
Get-ChildItem node_modules | Measure-Object  # ~450 carpetas
```

---

## 🐍 FASE 3: INSTALACIÓN DE DEPENDENCIAS BACKEND

### Paso 3.1: Navegar al backend

**Comando:**
```powershell
cd backend
```

**Ubicación actual:**
```
E:\GIT\LabPiPanel\IA\app\backend\
```

---

### Paso 3.2: Instalar dependencias Python

**¿Qué hace?** Lee `requirements.txt` e instala librerías Python

**¿Por qué?** El backend necesita:
- Flask (servidor web)
- Flask-CORS (permitir requests del frontend)
- Drivers de hardware (simulados)
- Librerías de procesamiento

**Comando:**
```powershell
pip install -r requirements.txt
```

**Lo que verás:**
```
Collecting flask==3.0.0
  Downloading flask-3.0.0.tar.gz
Collecting flask-cors
  Downloading flask_cors-4.0.0.tar.gz
...
Successfully installed flask-3.0.0 flask-cors-4.0.0 [...]
```

**⏱️ Tiempo:** 1-2 minutos

**¿Qué instala exactamente?**
```python
flask              # Servidor web
flask-cors         # Cross-Origin Resource Sharing
werkzeug           # Utilidades Flask
dataclasses        # Modelos de datos
typing-extensions  # Type hints
# [otros paquetes...]
```

---

### Paso 3.3: Verificar instalación

**Comando:**
```powershell
pip list | Select-String "flask"
```

**Resultado esperado:**
```
flask              3.0.0
flask-cors         4.0.0
```

---

## 🚀 FASE 4: INICIAR BACKEND

### Paso 4.1: Volver a carpeta raíz de app

**Comando:**
```powershell
cd ..  # Vuelve a E:\GIT\LabPiPanel\IA\app\
```

---

### Paso 4.2: Iniciar servidor Flask

**¿Qué hace?** Arranca el backend Python en puerto 5000

**¿Por qué?** El frontend necesita el backend corriendo para:
- Recibir datos en tiempo real (SSE)
- Hacer llamadas a la API REST
- Controlar hardware (simulado)

**Comando:**
```powershell
python backend\app.py
```

**Lo que verás:**
```
INFO:root:Iniciando Laboratorio Térmico ITM v1.0
INFO:root:Configurando hardware...
INFO:root:DAQ Reader: Simulado (sin hardware real)
INFO:root:Fuente XLN: Simulado (sin hardware real)
INFO:root:GPIO Controller: Simulado (sin hardware real)
INFO:root:Iniciando thread de adquisición de datos
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
Press CTRL+C to quit
```

**✅ Señales de que funciona:**
- Muestra "Running on http://127.0.0.1:5000"
- No hay errores rojos
- El cursor NO vuelve (está corriendo en loop)

**⚠️ NO CIERRES ESTA TERMINAL** - Debe quedar corriendo

---

### Paso 4.3: Entender qué está pasando

**Cuando arrancas el backend:**

1. **Se carga configuración** (`config.py`)
   ```python
   XLN_HOST = "192.168.1.100"
   DAQ_DEVICE_ID = 0
   RELAY_PINS = [17, 27, 22, 10]
   ```

2. **Se inicializan drivers** (simulados si no hay hardware)
   ```python
   daq = DAQReader()         # Simula temperaturas
   fuente = FuenteXLN()      # Simula voltaje/corriente
   gpio = GPIOController()   # Simula relés
   ```

3. **Se inicia thread de adquisición**
   ```python
   data_acquisition_loop()   # Cada 100ms lee datos
   ```

4. **Se exponen endpoints**
   ```
   GET  /api/status
   GET  /api/live-data  (SSE)
   POST /api/fuente/voltage
   POST /api/relay/0
   [20+ endpoints más...]
   ```

5. **Backend queda escuchando**
   - Puerto 5000
   - Esperando requests del frontend

---

### Paso 4.4: Probar que el backend responde

**Abre OTRA terminal PowerShell** (la primera debe seguir corriendo)

**Comando:**
```powershell
curl http://localhost:5000/api/status | ConvertFrom-Json
```

**Resultado esperado:**
```json
{
  "timestamp": "2026-02-04T14:30:45.123Z",
  "voltage": 0.0,
  "current": 0.0,
  "power": 0.0,
  "temperatures": [25.3, 26.1, 25.8, 42.3, 40.1, 39.8, 25.2, 26.0],
  "t_evap_avg": 25.73,
  "t_cond_avg": 40.0,
  "r_thermal": 0.0,
  "relays": [false, false, false, false],
  "recording": false,
  "fuente_connected": false,
  "daq_connected": false
}
```

**✅ Si ves esto:** ¡Backend funciona!

---

## 🎨 FASE 5: INICIAR FRONTEND

### Paso 5.1: Abrir NUEVA terminal

**¿Por qué?** El backend debe seguir corriendo en la primera terminal

**Acción:**
- Abre nueva ventana PowerShell
- O nueva pestaña en Windows Terminal

---

### Paso 5.2: Navegar a carpeta de app

**Comando:**
```powershell
cd E:\GIT\LabPiPanel\IA\app
```

---

### Paso 5.3: Iniciar servidor de desarrollo Vite

**¿Qué hace?** Arranca el servidor React en puerto 5173

**¿Por qué?** Para:
- Servir la aplicación React
- Hot reload (recarga automática al editar)
- Compilar TypeScript on-the-fly
- Servir con DevTools habilitados

**Comando:**
```powershell
npm run dev
```

**Lo que verás:**
```
  VITE v5.4.2  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

**✅ Señales de que funciona:**
- Muestra "ready in xxx ms"
- Muestra URLs locales
- No hay errores

**⚠️ NO CIERRES ESTA TERMINAL** - Debe quedar corriendo

---

### Paso 5.4: Entender qué está pasando

**Cuando arrancas npm run dev:**

1. **Vite lee configuración** (`vite.config.ts`)
   ```typescript
   server: {
     port: 5173,
     proxy: {
       '/api': 'http://localhost:5000'  // Redirige API al backend
     }
   }
   ```

2. **Compila TypeScript → JavaScript**
   ```
   src/App.tsx → dist/app.js
   src/components/*.tsx → dist/components/*.js
   ```

3. **Inicia servidor HTTP**
   - Puerto 5173
   - Hot Module Replacement (HMR) habilitado
   - Source maps para debugging

4. **Queda escuchando cambios**
   - Si editas un archivo .tsx
   - Recompila automáticamente
   - Recarga el navegador (hot reload)

---

## 🌐 FASE 6: ABRIR EN NAVEGADOR

### Paso 6.1: Abrir la aplicación

**Comando (en PowerShell):**
```powershell
Start-Process "http://localhost:5173"
```

**O simplemente:**
- Abre Chrome/Edge/Firefox
- Navega a: `http://localhost:5173`

---

### Paso 6.2: ¿Qué deberías ver?

**En el navegador aparecerá:**

```
┌─────────────────────────────────────────────────────┐
│ [HEADER]                                            │
│ Laboratorio Térmico ITM                             │
│ [●] Connected / [○] Disconnected                    │
└─────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ FUENTE       │ CONFIG       │ ALERTS       │
│ Control      │ Panel        │ Panel        │
│ [sliders]    │ [settings]   │ [alerts]     │
└──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┐
│ RELAY        │ RECORDING    │
│ Control      │ Control      │
│ [4 buttons]  │ [CSV export] │
└──────────────┴──────────────┘

┌─────────────────────────────────────────────────────┐
│ TEMPERATURE PANEL                                   │
│ T0: 25.3°C   T1: 26.1°C   T2: 25.8°C   T3: 42.3°C  │
│ T4: 40.1°C   T5: 39.8°C   T6: 25.2°C   T7: 26.0°C  │
│                                                     │
│ T_Evap_Avg: 25.73°C   T_Cond_Avg: 40.0°C           │
└─────────────────────────────────────────────────────┘

┌────────────────────┬────────────────────┐
│ TEMPERATURE        │ VOLTAGE-CURRENT    │
│ CHART              │ CHART              │
│ [8-channel graph]  │ [V-I graph]        │
└────────────────────┴────────────────────┘

┌────────────────────┬────────────────────┐
│ POWER              │ THERMAL RESIST.    │
│ CHART              │ CHART              │
│ [P graph]          │ [R_th graph]       │
└────────────────────┴────────────────────┘
```

---

### Paso 6.3: Verificar conexión

**En el header debe decir:**
```
[●] Connected
```

**Si dice "Disconnected":**
- El frontend no puede conectar al backend
- Verifica que backend esté corriendo (Terminal 1)
- Verifica puerto 5000 en `http://localhost:5000/api/status`

---

## 🔍 FASE 7: EXPLORAR LA APLICACIÓN

### Paso 7.1: Abrir DevTools

**¿Qué son?** Herramientas de desarrollador del navegador

**¿Por qué?** Para ver:
- Requests HTTP
- Eventos SSE
- Errores de consola
- State de React

**Cómo abrir:**
```
Presiona F12
O: Click derecho → Inspect
```

---

### Paso 7.2: Ver la pestaña Network

**¿Qué hace?** Muestra todas las llamadas HTTP

**Acción:**
1. Abre DevTools (F12)
2. Click en pestaña **Network**
3. Recarga página (F5)

**Deberías ver:**
```
Name              Status  Type        Size    Time
──────────────────────────────────────────────────
localhost:5173    200     document    5.2 KB  45ms
main.tsx          200     script      125 KB  80ms
live-data         200     eventsource (pending)
status            200     fetch       1.2 KB  12ms
```

**Explicación:**
- `localhost:5173` → HTML principal
- `main.tsx` → JavaScript compilado
- `live-data` → **SSE connection** (debe estar pendiente = abierto)
- `status` → Request inicial de estado

---

### Paso 7.3: Ver la pestaña Console

**¿Qué hace?** Muestra logs y errores

**Deberías ver:**
```javascript
[useLiveData] Conectando a SSE...
[useLiveData] Conectado exitosamente
[App] Datos recibidos: {timestamp: "...", voltage: 0, ...}
```

**❌ Si ves errores:**
```javascript
Failed to connect to http://localhost:5000
```
→ Backend no está corriendo

---

### Paso 7.4: Probar cambiar voltaje

**Acción:**
1. En el panel **Fuente Control**
2. Busca el slider de **Voltaje**
3. Muévelo a 150V
4. Presiona **Aplicar**

**¿Qué pasa internamente?**

```
1. Frontend (FuenteControl.tsx):
   → handleSetVoltage(150)

2. Hook (useFuente.ts):
   → fetch('http://localhost:5000/api/fuente/voltage', {
       method: 'POST',
       body: JSON.stringify({ voltage: 150 })
     })

3. Backend (app.py):
   → @app.route('/api/fuente/voltage', methods=['POST'])
   → fuente.set_voltage(150)
   → Responde: {'status': 'ok'}

4. Data Loop (cada 100ms):
   → Lee nuevo voltaje: fuente.get_voltage_current()
   → Crea LiveData con voltage=150.0
   → Envía por SSE

5. Frontend (useLiveData hook):
   → Recibe evento SSE
   → setData(newData)
   → React re-renderiza

6. UI actualiza:
   → FuenteControl muestra "150.0V"
   → Gráfica V-I se actualiza
   → Gráfica Power se actualiza
```

**En DevTools → Network verás:**
```
POST /api/fuente/voltage  200  20ms
```

**En la UI verás:**
```
Voltaje actual: 150.0 V
```

---

### Paso 7.5: Probar encender un relé

**Acción:**
1. En el panel **Relay Control**
2. Presiona botón **Compresor**

**¿Qué pasa?**

```
1. Frontend:
   → handleToggleRelay(0)

2. Request:
   → POST /api/relay/0
   → Body: { state: true }

3. Backend:
   → gpio.set_relay(0, true)
   → GPIO pin 17 → HIGH (simulado)

4. Data Loop:
   → Lee: gpio.get_all_states()
   → Retorna: [true, false, false, false]
   → Envía por SSE

5. Frontend actualiza:
   → RelayControl muestra botón verde
   → Texto: "Compresor ✓ ON"
```

**En la UI verás:**
```
[● Compresor]   (botón verde)
```

---

### Paso 7.6: Ver datos en tiempo real

**¿Qué hace?** El backend envía datos cada 100ms (10 Hz)

**Cómo verlo:**

1. **En DevTools → Network**
   - Busca request `live-data`
   - Click derecho → **"View EventStream"**

**Verás:**
```javascript
data: {"timestamp":"2026-02-04T14:30:45.123Z","voltage":150.0,...}
data: {"timestamp":"2026-02-04T14:30:45.223Z","voltage":150.0,...}
data: {"timestamp":"2026-02-04T14:30:45.323Z","voltage":150.0,...}
...
```

**Cada línea = 1 lectura de datos (100ms)**

2. **En las gráficas**
   - Observa cómo se dibujan líneas en tiempo real
   - Cada 100ms se agrega un punto nuevo
   - Historial de 300 puntos = 30 segundos

---

## 🧪 FASE 8: ENTENDER LOS DATOS

### Paso 8.1: Ver estructura LiveData

**En Console de DevTools, escribe:**
```javascript
// Esto muestra el último dato recibido
console.log(window.lastData)  // Si está expuesto
```

**O simplemente observa en Network → live-data:**

```json
{
  "timestamp": "2026-02-04T14:30:45.123Z",
  "elapsed_time": 3045.123,
  "voltage": 150.0,
  "current": 2.3,
  "power": 345.0,
  "temperatures": [25.3, 26.1, 25.8, 42.3, 40.1, 39.8, 25.2, 26.0],
  "t_evap_avg": 25.73,
  "t_cond_avg": 40.0,
  "r_thermal": 0.042,
  "relays": [true, false, false, false],
  "recording": false,
  "fuente_connected": false,
  "daq_connected": false
}
```

**Explicación de cada campo:**

| Campo | Tipo | Rango | Descripción |
|-------|------|-------|-------------|
| `timestamp` | string | ISO 8601 | Momento exacto de lectura |
| `elapsed_time` | number | 0+ segundos | Tiempo desde inicio sesión |
| `voltage` | number | 0-300 V | Voltaje de fuente |
| `current` | number | 0-5.2 A | Corriente de fuente |
| `power` | number | 0-1560 W | V × I calculado |
| `temperatures` | array[8] | 0-100°C | 8 termopares |
| `t_evap_avg` | number | 0-100°C | Promedio evaporador (T0+T1+T2)/3 |
| `t_cond_avg` | number | 0-100°C | Promedio condensador (T4+T5+T6)/3 |
| `r_thermal` | number | 0-10 K/W | ΔT / Power |
| `relays` | array[4] | bool | Estado de 4 relés |
| `recording` | bool | - | ¿Grabando CSV? |
| `fuente_connected` | bool | - | ¿Fuente conectada? |
| `daq_connected` | bool | - | ¿DAQ conectado? |

---

### Paso 8.2: Entender las temperaturas

```
temperatures[0] = T_Evap_In      (Entrada evaporador)
temperatures[1] = T_Evap_Mid     (Centro evaporador)
temperatures[2] = T_Evap_Out     (Salida evaporador)
temperatures[3] = T_Comp         (Compresor)
temperatures[4] = T_Cond_In      (Entrada condensador)
temperatures[5] = T_Cond_Mid     (Centro condensador)
temperatures[6] = T_Cond_Out     (Salida condensador)
temperatures[7] = T_Ambient      (Temperatura ambiente)
```

**Cálculos:**
```javascript
t_evap_avg = (T0 + T1 + T2) / 3
t_cond_avg = (T4 + T5 + T6) / 3
delta_T = |t_cond_avg - t_evap_avg|
r_thermal = delta_T / power
```

---

## 🎯 FASE 9: MODIFICAR Y VER CAMBIOS

### Paso 9.1: Editar un componente

**Vamos a cambiar el título del header**

**Acción:**
1. Abre `E:\GIT\LabPiPanel\IA\app\src\components\Header.tsx` en VS Code

2. Busca la línea (~línea 20):
```typescript
<h1 className="text-2xl font-bold">
  Laboratorio Térmico ITM
</h1>
```

3. Cámbiala a:
```typescript
<h1 className="text-2xl font-bold">
  🧪 Lab ITM - EN VIVO 🔥
</h1>
```

4. Guarda (Ctrl+S)

**¿Qué pasa?**

```
1. Vite detecta cambio en Header.tsx
2. Recompila ese archivo (100-200ms)
3. Envía actualización al navegador (HMR)
4. Navegador actualiza SIN recargar página
5. Ves el cambio instantáneamente
```

**En la terminal de Frontend verás:**
```
[vite] hmr update /src/components/Header.tsx
```

**En el navegador verás:**
```
🧪 Lab ITM - EN VIVO 🔥
```

---

### Paso 9.2: Cambiar un color

**Acción:**
1. Abre `E:\GIT\LabPiPanel\IA\app\src\index.css`

2. Busca (puede no existir, entonces agrégalo):
```css
.itm-card-header {
  background-color: #002060;  /* Azul ITM */
  color: white;
}
```

3. Cámbialo a:
```css
.itm-card-header {
  background-color: #E74C3C;  /* Rojo */
  color: white;
}
```

4. Guarda

**Resultado:** Headers de tarjetas ahora son rojos

---

## 🛑 FASE 10: DETENER TODO

### Paso 10.1: Detener Frontend

**En la terminal donde corre `npm run dev`:**
```
Presiona: Ctrl+C
```

**Verás:**
```
VITE server stopped
```

---

### Paso 10.2: Detener Backend

**En la terminal donde corre `python backend\app.py`:**
```
Presiona: Ctrl+C
```

**Verás:**
```
KeyboardInterrupt
Thread de adquisición detenido
```

---

## 📊 RESUMEN COMPLETO

### Terminals corriendo:

```
Terminal 1 (Backend):
  E:\GIT\LabPiPanel\IA\app> python backend\app.py
  → Ejecutando en http://localhost:5000

Terminal 2 (Frontend):
  E:\GIT\LabPiPanel\IA\app> npm run dev
  → Ejecutando en http://localhost:5173

Navegador:
  http://localhost:5173
  → Muestra la aplicación React
  → Se conecta al backend vía SSE
```

---

### Flujo de datos:

```
Backend (Python)                     Frontend (React)
─────────────────                    ────────────────
1. Lee hardware (simulado)
   ├─ DAQ: 8 temperaturas
   ├─ Fuente: V, I
   └─ GPIO: relés

2. Procesa datos                     
   ├─ Calcula promedios
   ├─ Calcula R_thermal
   └─ Crea LiveData object

3. Envía por SSE (100ms)  ──────►    4. Hook recibe datos
                                        └─ useLiveData.ts

5. User cambia voltaje    ◄──────    6. FuenteControl
                                        └─ POST /api/fuente/voltage

7. Fuente actualiza voltaje

8. Siguiente ciclo (100ms)
   └─ Lee nuevo voltaje   ──────►    9. Gráfica actualiza
```

---

## 🐛 PROBLEMAS COMUNES

### Error: "EADDRINUSE: address already in use"

**Causa:** Puerto 5000 o 5173 ya está en uso

**Solución:**
```powershell
# Encuentra proceso en puerto 5000
netstat -ano | findstr :5000

# Mata el proceso (reemplaza PID)
taskkill /PID <número> /F

# O cambia el puerto en vite.config.ts
```

---

### Error: "Module not found"

**Causa:** Dependencias no instaladas

**Solución:**
```powershell
# Reinstalar dependencias
rm -r node_modules
npm install
```

---

### Error: "Connection refused"

**Causa:** Backend no está corriendo

**Solución:**
```powershell
# Verifica que backend esté activo
curl http://localhost:5000/api/status
```

---

### Gráficas no se actualizan

**Causa:** SSE no conectado

**Solución:**
1. Abre DevTools → Network
2. Busca `live-data`
3. Debe decir "pending" o "200"
4. Si dice "failed" → backend no responde

---

## ✅ CHECKLIST FINAL

Marca lo que completaste:

- [ ] Node.js instalado y verificado
- [ ] Python instalado y verificado
- [ ] Dependencias npm instaladas (`node_modules/`)
- [ ] Dependencias pip instaladas
- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 5173
- [ ] Navegador abierto en `localhost:5173`
- [ ] Header muestra "Connected"
- [ ] Gráficas se actualizan en tiempo real
- [ ] Cambié voltaje y funcionó
- [ ] Encendí relé y funcionó
- [ ] Vi datos en DevTools → Network
- [ ] Entiendo el flujo de datos
- [ ] Modifiqué código y vi cambios (HMR)

---

## 🎓 LO QUE APRENDISTE

✅ Cómo funciona un stack React + Flask  
✅ Qué es SSE (Server-Sent Events)  
✅ Cómo se comunica frontend y backend  
✅ Cómo funciona hot reload (HMR)  
✅ Cómo debuggear con DevTools  
✅ Estructura de datos LiveData  
✅ Flujo completo de un cambio (voltaje)  
✅ Cómo funcionan los hooks React  
✅ Cómo usar npm y pip  
✅ Arquitectura del proyecto real  

---

**Guía de testeo v1.0 - 4 de febrero de 2026**
