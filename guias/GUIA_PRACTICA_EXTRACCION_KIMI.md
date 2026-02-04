# GUÍA PRÁCTICA: EXTRACCIÓN E INTEGRACIÓN DEL FRONTEND KIMI

**Objetivo:** Obtener el código de Kimi IA y integrarlo óptimamente con el backend existente  
**Fecha:** 4 de febrero de 2026  
**Estado del proyecto:**
- ✅ Backend: Funcionando (labpipanel.py)
- ✅ Frontend Bolt: Descargado en `IA/project/`
- ⏳ Frontend Kimi: En línea, necesita ser descargado

---

## 🎯 SITUACIÓN ACTUAL

```
e:\GIT\LabPiPanel\
├── IA/
│   └── project/                    ← BOLT.NEW (actual - a mantener)
│       ├── src/
│       │   ├── components/
│       │   ├── utils/
│       │   ├── types/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
└── [Backend funciona correctamente]
```

---

## PASO 1: DESCARGAR CÓDIGO DE KIMI IA

### Opción A: Desde la URL compartida (Recomendado)

La URL que compartiste: `https://33kpj7dv4ij64.ok.kimi.link`

Esta es una **sesión en vivo** de Kimi. Necesitas extraer el código de varias formas:

#### Método 1: Browser DevTools (Rápido)

```bash
# 1. Abre en navegador: https://33kpj7dv4ij64.ok.kimi.link
# 2. Presiona F12 para abrir DevTools
# 3. Ve a Elements/Inspector
# 4. Busca el código fuente (Ctrl+F busca "App.tsx" o "React")
# 5. Copia el código HTML/JSX que veas

# PROBLEMA: Esto solo te da el HTML renderizado, no el código fuente TypeScript
```

#### Método 2: Obtener código de Kimi directamente (Mejor)

Kimi IA probablemente tiene una opción para **descargar el proyecto**:

```bash
# En la interfaz de Kimi:
# 1. Busca botón "Export", "Download", "Code" o similar
# 2. Si dice "Download Project" → descarga ZIP
# 3. Si solo muestra código → selecciona todo (Ctrl+A)
# 4. Copia a archivo de texto

# Si no hay opción:
# → Pide a Kimi: "Export this project as ZIP" o "Give me the source code"
```

#### Método 3: Reproducir en Kimi nuevamente (Alternativo)

Si Kimi es un agente/IA que generó el proyecto:

```bash
# 1. Vuelve a usar Kimi IA
# 2. Pide el mismo proyecto con instrucción:
#    "Generate LabPiPanel frontend with:
#     - Advanced temperature charts (8 channels)
#     - Configuration panel
#     - Alert system
#     - Export as downloadable ZIP"
# 3. Descarga el ZIP resultante
```

---

## PASO 2: ANALIZAR ESTRUCTURA DE KIMI

Una vez tengas el código de Kimi, extrae a una carpeta temporal:

```bash
# En PowerShell
cd e:\GIT\LabPiPanel

# Crear carpeta temporal
mkdir temp_kimi

# Descomprimir/copiar el código de Kimi aquí
# (Supon que descargaste kimi-project.zip)
Expand-Archive -Path kimi-project.zip -DestinationPath temp_kimi

# Ver estructura
tree /F temp_kimi
```

**Estructura esperada de Kimi:**

```
temp_kimi/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── ChartSection.tsx
│   │   ├── ConfigPanel.tsx
│   │   ├── AlertPanel.tsx
│   │   ├── RelayControl.tsx
│   │   ├── RecordingPanel.tsx
│   │   └── [Otros componentes]
│   ├── utils/
│   │   ├── dataSimulator.ts (probablemente)
│   │   ├── csvExporter.ts
│   │   └── [Utilidades]
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── [Otros archivos de config]
```

---

## PASO 3: COMPARACIÓN LADO A LADO

Abre 2 carpetas en VS Code para comparar:

```bash
# Terminal en IA/project (Bolt)
code .

# Nueva ventana con Kimi
code e:\GIT\LabPiPanel\temp_kimi
```

**Compara estos archivos clave:**

| Archivo | Bolt | Kimi | Mejor |
|---------|------|------|-------|
| `App.tsx` | ✓ Funciona | ✓ Mejorado | **Kimi** (datos tiempo real) |
| `types/index.ts` | Básicos | Completos | **Kimi** (más campos) |
| `components/` | 7 componentes | ? componentes | Comparar cada uno |
| `utils/csvExporter` | Simple | ✓ Robusto | **Kimi** (validado) |
| `package.json` | Vite + React | Igual | Mismo |
| Styling | TailwindCSS | TailwindCSS | Mismo |

---

## PASO 4: ESTRATEGIA DE INTEGRACIÓN ÓPTIMA

### Opción A: Combinar lo mejor de ambos (RECOMENDADO)

```bash
# Crear nueva carpeta project_kimi que combine:

IA/
├── project/            ← BOLT (dejar intacto como referencia)
├── project_kimi/       ← NUEVA (combinación óptima)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx            ← De Kimi
│   │   │   ├── ChartSection.tsx         ← De Kimi
│   │   │   ├── ConfigPanel.tsx          ← De Kimi
│   │   │   ├── AlertPanel.tsx           ← De Kimi
│   │   │   ├── RelayControl.tsx         ← De Kimi
│   │   │   ├── PowerSourceControl.tsx   ← De Kimi (mejor)
│   │   │   ├── RecordingPanel.tsx       ← De Kimi
│   │   │   └── Header.tsx               ← De Kimi o Bolt (elegir)
│   │   ├── utils/
│   │   │   ├── apiClient.ts             ← NUEVO (integración)
│   │   │   ├── csvExporter.ts           ← De Kimi
│   │   │   └── dataSimulator.ts         ← De Kimi
│   │   ├── hooks/
│   │   │   ├── useLiveData.ts           ← NUEVO
│   │   │   └── useFuenteControl.ts      ← NUEVO
│   │   ├── types/
│   │   │   └── index.ts                 ← De Kimi (más completo)
│   │   ├── App.tsx                      ← PERSONALIZADO
│   │   ├── main.tsx                     ← De Kimi
│   │   └── index.css                    ← De Kimi
│   ├── public/
│   │   └── [Assets de Kimi]
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local                       ← NUEVO
```

---

## PASO 5: PASOS PRÁCTICOS DE INTEGRACIÓN

### 5.1 Preparar estructura

```bash
# En PowerShell
cd e:\GIT\LabPiPanel\IA

# Copiar estructura de Kimi como base
Copy-Item -Path temp_kimi -Destination project_kimi -Recurse

# Verificar
dir project_kimi
```

### 5.2 Mejorar App.tsx

**Reemplaza `IA/project_kimi/src/App.tsx` con esto:**

```typescript
import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ConfigPanel } from './components/ConfigPanel';
import { AlertPanel } from './components/AlertPanel';
import { RelayControl } from './components/RelayControl';
import { RecordingPanel } from './components/RecordingPanel';
import { PowerSourceControl } from './components/PowerSourceControl';
import { ChartSection } from './components/ChartSection';
import { LiveData, FuenteStatus, Alert } from './types';
import { useLiveData } from './hooks/useLiveData';
import { useFuenteControl } from './hooks/useFuenteControl';

export function App() {
  // Hook WebSocket para datos en vivo
  const { data: liveData, isConnected, error } = useLiveData();
  
  // Hook para control de fuente
  const fuenteControl = useFuenteControl();
  
  // Estado local
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [config, setConfig] = useState({
    fuenteHost: '192.168.1.100',
    fuentePort: 5024,
    maxVoltage: 280,
    maxCurrent: 5.0,
    sampleRate: 100,
  });

  // Validar límites de seguridad
  useEffect(() => {
    if (liveData && liveData.T_evap_avg > 120) {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        severity: 'critical',
        message: 'Temperatura evaporador > 120°C',
        timestamp: new Date()
      }]);
    }
  }, [liveData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header isConnected={isConnected} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Estado de conexión */}
        {!isConnected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
            ⚠️ {error || 'Desconectado del servidor'}
          </div>
        )}

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda: Control y datos */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Control de Fuente */}
            <PowerSourceControl 
              status={fuenteControl}
              onVoltageChange={fuenteControl.setVoltage}
              onCurrentChange={fuenteControl.setCurrent}
              onToggleOutput={fuenteControl.toggleOutput}
            />

            {/* Gráficos en tiempo real */}
            {liveData && (
              <ChartSection 
                data={liveData}
              />
            )}

            {/* Control de relés */}
            {liveData && (
              <RelayControl 
                states={[
                  liveData.relay_1,
                  liveData.relay_2,
                  liveData.relay_3,
                  liveData.relay_4
                ]}
                labels={['Bomba', 'Ventilador 1', 'Ventilador 2', 'Compresor']}
                onToggle={(idx, state) => {
                  // API call para cambiar relé
                  console.log(`Relay ${idx + 1}: ${state}`);
                }}
              />
            )}

            {/* Panel de grabación */}
            <RecordingPanel 
              isRecording={isRecording}
              onStart={() => setIsRecording(true)}
              onStop={() => setIsRecording(false)}
              sampleRate={config.sampleRate}
            />
          </div>

          {/* Columna derecha: Configuración y alertas */}
          <div className="space-y-6">
            
            {/* Panel de alertas */}
            <AlertPanel 
              alerts={alerts}
              onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
            />

            {/* Panel de configuración */}
            <ConfigPanel 
              config={config}
              onChange={setConfig}
              limits={{
                maxVoltage: 300,
                maxCurrent: 5.2,
                maxPower: 1500,
                maxTemp: 120,
                minTemp: -40
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
```

### 5.3 Crear archivo .env.local

Crea `IA/project_kimi/.env.local`:

```env
# API Backend
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=http://localhost:5000

# Environment
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug

# Configuración frontend
VITE_SAMPLE_RATE=100
VITE_MAX_DATA_POINTS=150
VITE_CHART_UPDATE_INTERVAL=100
```

### 5.4 Actualizar package.json

Asegúrate que tenga estas dependencias:

```json
{
  "name": "labpipanel-frontend",
  "version": "1.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext .ts,.tsx",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "socket.io-client": "^4.7.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```

---

## PASO 6: INSTALACIÓN Y TESTING

```bash
# Navegar a proyecto
cd e:\GIT\LabPiPanel\IA\project_kimi

# Instalar dependencias
npm install

# Verificar que todo compila
npm run typecheck

# Ejecutar en desarrollo
npm run dev

# Debería estar disponible en:
# http://localhost:5173

# En otra terminal, inicia backend
cd e:\GIT\LabPiPanel
python labpipanel.py
# http://localhost:5000/api/status
```

---

## PASO 7: VALIDACIÓN

### Checklist de verificación

- [ ] Frontend carga sin errores en http://localhost:5173
- [ ] Consola del navegador (F12) no muestra errores
- [ ] Backend accesible en http://localhost:5000/api/status
- [ ] Componentes Kimi se renderizan correctamente
- [ ] Layout es responsivo
- [ ] Estilos TailwindCSS aplican correctamente
- [ ] Sin warnings en terminal npm

---

## PASO 8: INTEGRACIÓN CON BACKEND

Una vez validado el frontend, integra con el backend mejorado:

```bash
# Backend mejorado con WebSocket
cd e:\GIT\LabPiPanel

# Instalar dependencias nuevas
pip install flask-cors flask-socketio python-socketio

# Actualizar labpipanel.py (ver GUIA_CODIGO_STARTER_KIMI.md)

# Reiniciar backend
python labpipanel.py
```

---

## PASO 9: COMPARACIÓN FINAL

**Crear documento de comparación:**

```markdown
# COMPARATIVA: BOLT vs KIMI - DECISIÓN FINAL

## Bolt (Original)
- ✓ Funciona
- ✗ Gráficos básicos (canvas manual)
- ✗ Configuración limitada
- ✗ Sin sistema de alertas robusto
- ✗ Datos simulados

## Kimi (Mejorado)
- ✓ Funciona
- ✓ Gráficos avanzados
- ✓ Configuración completa
- ✓ Sistema alertas robusto
- ✓ Listos para datos reales

## DECISIÓN: Usar Kimi como base
```

---

## 📋 EXTRACTO DE CÓDIGO DE KIMI A MANTENER

Si tienes dificultades accediendo al código de Kimi, aquí está lo **mínimo esencial** que necesitas:

### Si Kimi tiene mejor `types/index.ts`:

```typescript
// src/types/index.ts
export interface LiveData {
  timestamp: string;
  elapsed_time: number;
  voltaje: number;
  corriente: number;
  potencia: number;
  T_ch0: number;
  T_ch1: number;
  T_ch2: number;
  T_ch3: number;
  T_ch4: number;
  T_ch5: number;
  T_ch6: number;
  T_ch7: number;
  T_evap_avg: number;
  T_cond_avg: number;
  R_thermal: number;
  relay_1: boolean;
  relay_2: boolean;
  relay_3: boolean;
  relay_4: boolean;
}

export interface FuenteStatus {
  connected: boolean;
  output_enabled: boolean;
  voltage_set: number;
  current_set: number;
  voltage_actual: number;
  current_actual: number;
  power: number;
}

export interface Alert {
  id: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
}
```

---

## 🎯 RESUMEN DE LA ESTRATEGIA

```
1. DESCARGAR Kimi
   ├─ URL: https://33kpj7dv4ij64.ok.kimi.link
   ├─ Extraer código
   └─ Guardar en temp_kimi/

2. COMPARAR Bolt vs Kimi
   ├─ Abrir side-by-side en VS Code
   ├─ Identificar mejoras de Kimi
   └─ Documentar diferencias

3. CREAR project_kimi
   ├─ Copiar estructura Kimi
   ├─ Mejorar App.tsx
   ├─ Agregar integración
   └─ Agregar .env.local

4. TESTING
   ├─ npm install && npm run dev
   ├─ python labpipanel.py
   └─ Validar en navegador

5. BACKEND
   ├─ Agregar WebSocket
   ├─ Agregar CORS
   └─ Integrar hooks

6. DESPLIEGUE RPi
   ├─ Copiar proyecto
   ├─ npm run build
   └─ Nginx + systemd
```

---

## 🔗 REFERENCIAS

- **Código completo de Kimi:** https://33kpj7dv4ij64.ok.kimi.link
- **Documentación de implementación:** REPORTE_INTEGRACION_FRONTEND_KIMI.md
- **Código starter del backend:** GUIA_CODIGO_STARTER_KIMI.md
- **Checklist:** CHECKLIST_INTEGRACION_KIMI.md

---

**Guía práctica v1.0 - 4 de febrero de 2026**  
**Instituto Tecnológico Metropolitano (ITM)**
