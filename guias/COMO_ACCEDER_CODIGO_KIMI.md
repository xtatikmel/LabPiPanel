# ACCESO AL CÓDIGO DE KIMI IA - INSTRUCCIONES ESPECÍFICAS

**Fecha:** 4 de febrero de 2026  
**Objetivo:** Obtener el código fuente del frontend de Kimi IA

---

## 🎯 SITUACIÓN

Tienes una URL: `https://33kpj7dv4ij64.ok.kimi.link`

Esta es una **sesión en vivo** del generador Kimi. Aquí está cómo acceder al código:

---

## OPCIÓN 1: ACCESO DIRECTO (MÁS FÁCIL)

### Paso 1: Entra a la URL

```
https://33kpj7dv4ij64.ok.kimi.link
```

### Paso 2: Busca opciones de descarga

Dentro de la interfaz de Kimi, busca uno de estos botones:

- **"Download Project"** → Descarga ZIP
- **"Export as ZIP"** → Descarga código
- **"Get Source Code"** → Descarga o copia
- **"View Code"** → Ver código
- **"Copy to Clipboard"** → Copiar todo el código
- **"GitHub"** → Si está en GitHub, clona desde ahí

### Paso 3: Si hay botón de descarga

```bash
# Descargará algo como: kimi-project.zip o labpipanel.zip

# En PowerShell:
cd Downloads
Expand-Archive -Path labpipanel.zip -DestinationPath e:\GIT\LabPiPanel\temp_kimi
```

---

## OPCIÓN 2: COPIAR DESDE LA INTERFAZ WEB

Si no hay botón de descarga, extrae el código manualmente:

### Paso 1: Abre DevTools

```
F12 en tu navegador
```

### Paso 2: Ve a la pestaña "Elements"

```
F12 → Elements/Inspector
```

### Paso 3: Busca el código fuente

```
Ctrl+F → Busca: "export default App"
o "function App()"
```

### Paso 4: Copia el código

```
Haz clic derecho → Copy Element
```

**PROBLEMA:** Esto solo te da HTML renderizado, no el código TypeScript original.

---

## OPCIÓN 3: PEDIR A KIMI EXPLÍCITAMENTE (RECOMENDADO)

Si Kimi es un agente interactivo, **pídele que exporte**:

### En el chat de Kimi, escribe:

```
"I need the source code of this project. 
Please provide:
1. All TypeScript/TSX files
2. Configuration files (package.json, vite.config.ts, etc.)
3. As a ZIP file I can download

The project should include:
- Dashboard with temperature charts (8 channels)
- Configuration panel
- Alert system
- Control panel for relays
- Recording panel
- Real-time data display"
```

Luego Kimi te generará un **botón de descarga** del ZIP.

---

## OPCIÓN 4: ACCEDER AL PROYECTO EN KIMI.COM

Si Kimi IA guardó el proyecto en su plataforma:

### Paso 1: Ve a `kimi.com`

```
https://www.kimi.com
```

### Paso 2: Accede a tu cuenta

```
Login → My Projects / Workspace
```

### Paso 3: Busca el proyecto

```
Nombre: LabPiPanel (o el que hayas nombrado)
```

### Paso 4: Descarga

```
Click derecho en el proyecto → Download
o "Export as ZIP"
```

---

## OPCIÓN 5: SI TIENES ACCESO AL CÓDIGO EN LÍNEA

Si la URL solo muestra vista previa, pero hay un editor visible:

```javascript
// En consola del navegador (F12 → Console), ejecuta:

// Esto extrae todo el código visible
const code = document.body.innerText;
console.log(code);

// Copia en block de notas
```

---

## ALTERNATIVA: REPRODUCIR CON KIMI

Si no logras descargar, **genera de nuevo** de forma más específica:

### En la interfaz de Kimi, pide:

```
"Generate a React + Vite + TypeScript frontend for a thermal lab control system with:

1. DASHBOARD:
   - Real-time charts (8 temperature channels)
   - Evaporator and condenser average temperatures
   - V-I-P power measurements
   - Thermal resistance calculation

2. CONFIGURATION PANEL:
   - Power source IP/Port settings
   - Voltage limits (0-300V)
   - Current limits (0-5.2A)
   - Sample rate configuration
   - Temperature alarm thresholds

3. COMPONENTS:
   - Header with connection status
   - Power control panel (V/I sliders)
   - Relay control (4 buttons with labels)
   - Recording panel (CSV export)
   - Real-time alert system
   - Data display cards

4. STYLING:
   - TailwindCSS for styling
   - Responsive design
   - Professional ITM branding
   - Dark mode support (optional)

5. DATA HANDLING:
   - WebSocket support (prepare structure for real-time data)
   - CSV export functionality
   - Data validation
   - Error handling

Generate as complete, production-ready code with all files.
Download as ZIP."
```

Kimi generará un **nuevo proyecto** con mejor especificación.

---

## PASOS DESPUÉS DE DESCARGAR

Una vez tengas el ZIP:

```bash
# Extrae
cd e:\GIT\LabPiPanel
Expand-Archive -Path [archivo].zip -DestinationPath temp_kimi

# Estructura esperada
temp_kimi/
├── src/
│   ├── components/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── [otros archivos]

# Copia a proyecto_kimi
Copy-Item -Path temp_kimi/* -Destination IA/project_kimi -Recurse -Force

# Instala dependencias
cd IA/project_kimi
npm install

# Prueba
npm run dev
```

---

## SI TIENES EL CÓDIGO, AQUÍ ESTÁ CÓMO USARLO

### Carpeta correcta para el frontend

```
e:\GIT\LabPiPanel\
├── IA/
│   ├── project/           ← Bolt (original, mantener)
│   └── project_kimi/      ← Kimi (nuevo, usar este)
│       ├── src/
│       │   ├── components/
│       │   │   ├── Header.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ChartSection.tsx
│       │   │   ├── ConfigPanel.tsx
│       │   │   ├── AlertPanel.tsx
│       │   │   ├── RelayControl.tsx
│       │   │   ├── PowerSourceControl.tsx
│       │   │   ├── RecordingPanel.tsx
│       │   │   └── SettingsPanel.tsx
│       │   ├── utils/
│       │   │   ├── apiClient.ts        ← NUEVO
│       │   │   ├── csvExporter.ts
│       │   │   └── dataSimulator.ts
│       │   ├── hooks/
│       │   │   ├── useLiveData.ts      ← NUEVO
│       │   │   └── useFuenteControl.ts ← NUEVO
│       │   ├── types/
│       │   │   └── index.ts
│       │   ├── App.tsx                 ← Mejorado
│       │   ├── main.tsx
│       │   └── index.css
│       ├── public/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── .env.local                  ← NUEVO
│       └── .gitignore
```

---

## VERIFICACIÓN: ¿TIENES EL CÓDIGO?

Puedes verificar si obtuviste todo lo necesario:

```bash
# En PowerShell, en la carpeta del proyecto Kimi:
cd e:\GIT\LabPiPanel\IA\project_kimi

# Verificar archivos clave
Test-Path src/App.tsx              # Debe ser True
Test-Path src/components/          # Debe ser True
Test-Path package.json             # Debe ser True
Test-Path vite.config.ts           # Debe ser True

# Contar componentes
(Get-ChildItem src/components -Filter "*.tsx").Count  # Debe ser > 5

# Verificar dependencias
Select-String "react" package.json  # Debe encontrar React
```

---

## SIGUIENTE PASO: INTEGRACIÓN

Una vez que tengas el código de Kimi en `IA/project_kimi/`:

1. Lee: **GUIA_PRACTICA_EXTRACCION_KIMI.md**
2. Sigue: **CHECKLIST_INTEGRACION_KIMI.md - FASE 1-3**
3. Implementa: **GUIA_CODIGO_STARTER_KIMI.md**

---

## 📞 PROBLEMAS COMUNES

### "No hay botón de descarga"

**Solución:** Pide a Kimi en el chat:
```
"Export this as a downloadable ZIP file with all source code"
```

### "Solo veo HTML renderizado"

**Solución:** Accede a kimi.com y busca "My Projects" para descargar desde ahí.

### "No puedo acceder a la URL"

**Solución:** 
- Verifica que el link esté correcto
- Puede haber expirado (sessiones Kimi duran 48h típicamente)
- Si expiró, pide a Kimi nuevo proyecto con instrucciones específicas

### "El ZIP está corrupto"

**Solución:** Intenta:
```powershell
# Extraer con método alternativo
tar -xf archivo.zip -C destino
```

---

## ✅ RESUMEN

1. **Accede** a https://33kpj7dv4ij64.ok.kimi.link
2. **Busca** opción de descarga (Download / Export)
3. **Si no hay**, pide a Kimi que exporte como ZIP
4. **Descarga** el archivo
5. **Extrae** a `e:\GIT\LabPiPanel\temp_kimi\`
6. **Copia** a `e:\GIT\LabPiPanel\IA\project_kimi\`
7. **Instala** `npm install`
8. **Continúa** con guía de integración

---

**Guía de acceso v1.0 - 4 de febrero de 2026**
