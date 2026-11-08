# 📋 Plan de Reorganización Arquitectónica

## Estado Actual vs Propuesto

### ❌ Estructura Actual (Problemática)
```
IA/
├── project/           # Proyecto Bolt.new (obsoleto)
│   ├── src/
│   ├── package.json
│   └── ...
├── app/               # Código integrado (actual)
    ├── frontend (src/)
    ├── backend/
    └── ...
```

**Problemas:**
- Dos carpetas innecesarias
- Mezcla confusa entre código obsoleto y actual
- Difícil de escalar
- Sin estructura clara de monorepo profesional

---

## ✅ Nueva Arquitectura Propuesta

### Opción A: Estructura Monorepo Profesional

```
LabPiPanel/
├── apps/                          # Aplicaciones
│   ├── frontend/                  # React + Vite (cliente)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── ...
│   │
│   └── backend/                   # Flask (servidor)
│       ├── app.py
│       ├── requirements.txt
│       ├── alerts/
│       ├── hardware/
│       ├── models/
│       ├── recording/
│       └── ...
│
├── packages/                      # Paquetes compartidos (opcional futuro)
│   └── types/                     # Tipos compartidos frontend-backend
│
├── docs/                          # Documentación
│   └── guias/
│
├── scripts/                       # Scripts de utilidad
│   ├── start-dev.sh              # Iniciar ambos servicios
│   ├── build-all.sh              # Build de producción
│   └── ...
│
├── docker-compose.yml             # Orquestación
├── Makefile                       # Tareas comunes
├── package.json                   # Root workspace (monorepo)
├── tsconfig.base.json             # TypeScript base
└── README.md
```

**Ventajas:**
- ✅ Estructura profesional de monorepo
- ✅ Escalable para múltiples aplicaciones
- ✅ Código compartido reutilizable
- ✅ Scripts centralizados
- ✅ Fácil mantenimiento
- ✅ CI/CD simplificado
- ✅ Compatible con herramientas modernas

---

## 📊 Comparación de Cambios

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Frontend | `IA/app/src/` | `apps/frontend/src/` |
| Backend | `IA/app/backend/` | `apps/backend/` |
| Documentación | Raíz dispersa | `docs/guias/` |
| Scripts | Inexistentes | `scripts/` |
| Build unificado | No | Sí (Makefile, root package.json) |
| Escalabilidad | Baja | Alta |
| Profesionalismo | Bajo | Alto |

---

## 🔧 Cambios Requeridos

### 1. Estructura de Carpetas
```bash
✓ Crear: apps/frontend/
✓ Crear: apps/backend/
✓ Crear: packages/
✓ Crear: scripts/
✓ Mover: IA/app/src/* → apps/frontend/src/
✓ Mover: IA/app/backend/* → apps/backend/
✓ Mover: IA/app/package.json → apps/frontend/package.json
✓ Eliminar: IA/project/ (obsoleto)
✓ Eliminar: IA/app/ (consolidado)
✓ Eliminar: IA/ (si queda vacía)
```

### 2. Actualizaciones de Configuración

**Vite (frontend):**
- ✓ Actualizar rutas en vite.config.ts
- ✓ Actualizar imports relativos

**Flask (backend):**
- ✓ Actualizar rutas de módulos
- ✓ Actualizar directorios de archivos de datos

**Docker:**
- ✓ Actualizar WORKDIR y COPY paths

**Documentación:**
- ✓ Actualizar todas las referencias de ruta

### 3. Scripts de Automatización

**Makefile (root):**
```makefile
.PHONY: install dev build clean

install:
	cd apps/frontend && npm install
	cd apps/backend && pip install -r requirements.txt

dev:
	cd apps/frontend && npm run dev &
	cd apps/backend && python app.py

build:
	cd apps/frontend && npm run build
	cd apps/backend && python -m py_compile app.py

clean:
	rm -rf apps/frontend/dist
	rm -rf apps/frontend/node_modules
	rm -rf apps/backend/__pycache__
```

**start-dev.sh (Windows: start-dev.ps1):**
```powershell
# Iniciar backend
cd apps/backend
python app.py &
$backendPID = $PID

# Iniciar frontend
cd ../../apps/frontend
npm run dev &
$frontendPID = $PID

Write-Host "✓ Backend (PID: $backendPID)"
Write-Host "✓ Frontend (PID: $frontendPID)"
```

---

## 📝 Plan de Ejecución

### Fase 1: Preparación (2 min)
- ✅ Crear estructura de carpetas
- ✅ Copiar archivos sin eliminar originals

### Fase 2: Migración (5 min)
- ✅ Actualizar paths en configuraciones
- ✅ Verificar que código compila

### Fase 3: Validación (10 min)
- ✅ Probar frontend en nueva ubicación
- ✅ Probar backend en nueva ubicación
- ✅ Probar comunicación frontend-backend

### Fase 4: Limpieza (2 min)
- ✅ Eliminar carpetas antiguas
- ✅ Actualizar documentación

---

## ⚠️ Riesgos y Mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|------------|-----------|
| Imports rotos | Alta | Actualizar todos los paths antes de eliminar |
| Rutas relativas incorrectas | Alta | Probar antes de eliminar directorios |
| Archivos .gitignore | Media | Revisar y actualizar |
| Configuraciones perdidas | Baja | Backup de IA/app antes de eliminar |

---

## 💡 Recomendación Final

**Propongo implementar: Opción A (Estructura Monorepo Profesional)**

Razones:
1. ✅ Escalabilidad futura (múltiples apps, servicios)
2. ✅ Estructura probada en industria
3. ✅ Mejora CI/CD y despliegue
4. ✅ Facilita testing compartido
5. ✅ Proporciona imagen profesional

---

## ❓ Próximos Pasos

**¿Apruebas esta reorganización?**

Si aceptas, procederé con:
1. Crear nueva estructura
2. Migrar archivos
3. Actualizar todas las referencias
4. Probar que funcione
5. Eliminar directorios antiguos

**¿Alguna sugerencia o cambio?**
