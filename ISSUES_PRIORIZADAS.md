# Issues Priorizadas - LabPiPanel

Documento de trabajo con todas las tareas identificadas en la auditoría técnica, organizadas por prioridad y sprint.

---

## 🔴 CRÍTICOS (Sprint 1 - 2 semanas)

### Issue #1: Versionar todas las dependencias Python
- **Prioridad**: CRÍTICO
- **Estimación**: 2 horas
- **Status**: ⬜ NOT STARTED
- **Assignee**: 
- **Description**: 
  - `requirements.txt` no tiene versiones → builds no reproducibles
  - Causa: Dependencias flotantes pueden traer cambios incompatibles
  - Impacto: Fallos aleatorios en instalación limpia
  
- **Tareas**:
  - [ ] Instalar dependencias actuales en venv limpio
  - [ ] Ejecutar `pip freeze > requirements.lock.txt`
  - [ ] Actualizar `requirements.txt` con versiones específicas (ver tabla en auditoría)
  - [ ] Probar instalación limpia: `rm -rf venv && python3 -m venv venv && pip install -r requirements.txt`
  - [ ] Verificar compatibilidad: `python3 labpipanel.py --check-imports`
  - [ ] Commit: `git add requirements.txt requirements.lock.txt && git commit -m "fix: pin Python dependency versions"`

- **Checklist de Aceptación**:
  - ✅ Todas las librerías en `requirements.txt` tienen versión específica
  - ✅ Instalación limpia exitosa
  - ✅ No hay advertencias de compatibilidad
  - ✅ Backend inicia sin errores: `python3 labpipanel.py`

- **Dependencias**: Ninguna
- **Bloquea**: #5, #6

---

### Issue #2: Generar package-lock.json
- **Prioridad**: CRÍTICO
- **Estimación**: 1 hora
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - `package-lock.json` faltante → NPM instala versiones variables
  - Reproducibilidad comprometida
  
- **Tareas**:
  - [ ] Eliminar `node_modules`: `rm -rf node_modules`
  - [ ] Eliminar `package-lock.json` si existe
  - [ ] Reinstalar: `npm install`
  - [ ] Generar lock: `npm ci --package-lock-only`
  - [ ] Verificar: `npm ls` (sin errores)
  - [ ] Commit: `git add package-lock.json && git commit -m "chore: add npm lock file"`

- **Checklist de Aceptación**:
  - ✅ `package-lock.json` existe y es válido
  - ✅ `npm ci` instala sin errores
  - ✅ Build Next.js exitoso: `npm run build`

- **Dependencias**: Ninguna
- **Bloquea**: #6

---

### Issue #3: Crear .env.example
- **Prioridad**: CRÍTICO
- **Estimación**: 1 hora
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Nuevos contribuidores no saben qué variables de entorno configurar
  - Sin documentación de vars requeridas vs. opcionales
  
- **Tareas**:
  - [ ] Crear `.env.example` (ver contenido en auditoría)
  - [ ] Documentar cada variable: tipo, rango, default, propósito
  - [ ] Incluir comentarios explicativos
  - [ ] Testear: `cp .env.example .env && python3 labpipanel.py`
  - [ ] Agregar sección en README

- **Entregable**: Archivo `.env.example` documentado

- **Checklist de Aceptación**:
  - ✅ `.env.example` existe con todas las vars
  - ✅ Cada var tiene comentario explicativo
  - ✅ Valores por defecto son válidos para desarrollo
  - ✅ Documentación clara sobre vars requeridas para producción

- **Dependencias**: Ninguna

---

### Issue #4: Agregar python-dotenv a requirements.txt
- **Prioridad**: CRÍTICO
- **Estimación**: 30 minutos
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - `config.py` usa `os.getenv()` pero no carga archivo `.env`
  - Variables no se cargan automáticamente
  
- **Tareas**:
  - [ ] Agregar `python-dotenv==1.0.0` a requirements.txt
  - [ ] Actualizar `config.py`: agregar al inicio `from dotenv import load_dotenv; load_dotenv()`
  - [ ] Testear carga de vars: `python3 -c "from config import *; print(FLASK_HOST)"`

- **Checklist de Aceptación**:
  - ✅ `python-dotenv==1.0.0` en `requirements.txt`
  - ✅ `config.py` carga `.env` al importar
  - ✅ Variables se leen correctamente

- **Dependencias**: #1, #3
- **Bloqueado por**: #1, #3

---

### Issue #5: Crear suite de tests unitarios (80% coverage)
- **Prioridad**: CRÍTICO
- **Estimación**: 16 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Cero tests unitarios → sin validación de lógica
  - Alto riesgo de regresiones silenciosas
  
- **Módulos a testear** (en orden de prioridad):
  1. `fuente_xln.py` (40% → 90% coverage)
     - Validación de voltaje/corriente
     - Parseo de respuestas Telnet
     - Manejo de errores de conexión
     - Tests: ~25 casos
  
  2. `daq_usb5203.py` 
     - Validación de canales
     - Validación de rangos de temperatura
     - Manejo de tipos de termopares
     - Parseo de salida MCC
     - Tests: ~20 casos
  
  3. `relay_controller.py`
     - Activate/deactivate relés
     - Validación de nombres
     - Modo simulación (sin GPIO real)
     - Tests: ~15 casos
  
  4. `thermal_experiment.py`
     - Cálculo de potencia
     - Cálculo de resistencia térmica
     - Validación de limites
     - Tests: ~15 casos
  
  5. `config.py`
     - Carga de variables
     - Validación de tipos
     - Valores por defecto
     - Tests: ~10 casos

- **Tareas**:
  - [ ] Instalar `pytest pytest-cov pytest-mock`: `pip install -r requirements-dev.txt`
  - [ ] Crear estructura: `mkdir -p tests/unit tests/integration`
  - [ ] Crear `conftest.py` con fixtures comunes
  - [ ] Escribir tests para cada módulo
  - [ ] Ejecutar: `pytest tests/unit/ --cov=. --cov-report=html`
  - [ ] Target: 80%+ coverage

- **Entregable**: 
  - `tests/` directory con 80+ test cases
  - `coverage/` HTML report
  - `conftest.py` con fixtures reutilizables

- **Checklist de Aceptación**:
  - ✅ 80%+ coverage en archivos principales
  - ✅ Todos los tests pasan (verde)
  - ✅ No hay warnings en pytest
  - ✅ Mock de hardware funciona correctamente
  - ✅ Coverage report accesible en `htmlcov/index.html`

- **Dependencias**: #1, #4
- **Bloqueado por**: #1, #4
- **Bloquea**: #6

---

### Issue #6: Implementar CI/CD con GitHub Actions
- **Prioridad**: CRÍTICO
- **Estimación**: 8 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin CI/CD → despliegues no validados
  - Riesgos de código roto en main
  
- **Workflow a implementar**:
  ```yaml
  - name: Lint & Format Check (flake8, black)
  - name: Type Check (mypy)
  - name: Unit Tests (pytest, coverage)
  - name: Build Docker
  - name: Push to Registry (si main)
  - name: Deploy (si main)
  ```

- **Tareas**:
  - [ ] Crear `.github/workflows/test-deploy.yml`
  - [ ] Configurar triggers: push a main/develop, PR
  - [ ] Job 1: Lint (flake8 *.py)
  - [ ] Job 2: Type check (mypy *.py)
  - [ ] Job 3: Tests (pytest --cov)
  - [ ] Job 4: Build Docker (opcional)
  - [ ] Job 5: Deploy (solo si main)
  - [ ] Proteger main branch: require all checks to pass

- **Entregable**: `.github/workflows/test-deploy.yml`

- **Checklist de Aceptación**:
  - ✅ Workflow se ejecuta en cada push
  - ✅ Tests fallan = bloquea merge
  - ✅ Coverage report se adjunta
  - ✅ Docker se build exitosamente
  - ✅ Main branch está protegida

- **Dependencias**: #1, #2, #5
- **Bloqueado por**: #1, #2, #5

---

### Issue #7: Crear Dockerfile multi-stage optimizado
- **Prioridad**: CRÍTICO
- **Estimación**: 4 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin Dockerfile → despliegue no reproducible
  - Dificultad para replicar en nuevos Raspberry Pi
  
- **Requerimientos**:
  - Multi-stage (backend + frontend)
  - Soporte ARM64 (Raspberry Pi)
  - Incluir MCC drivers
  - Health check
  - Volúmenes para logs/results

- **Tareas**:
  - [ ] Crear `Dockerfile` (ver estructura en auditoría)
  - [ ] Build Python stage con `requirements.txt`
  - [ ] Build Node stage con `npm ci`
  - [ ] Runtime stage que combine ambos
  - [ ] Agregar health check: `curl /api/status`
  - [ ] Testear build local: `docker build -t labpipanel:test .`
  - [ ] Verificar imagen: `docker run -p 5000:5000 labpipanel:test`

- **Entregable**: `Dockerfile` productivo

- **Checklist de Aceptación**:
  - ✅ Dockerfile construye sin errores
  - ✅ Imagen < 1 GB (si es posible)
  - ✅ Container inicia correctamente
  - ✅ API accesible en `http://localhost:5000/api/status`
  - ✅ Health check funciona
  - ✅ Soporta ARM64

- **Dependencias**: #1, #2
- **Bloqueado por**: #1, #2
- **Bloquea**: #8

---

### Issue #8: Documentar instalación de drivers MCC
- **Prioridad**: CRÍTICO
- **Estimación**: 2 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - DAQ USB-5203 no funciona sin drivers MCC
  - Documentación faltante → no se sabe cómo instalar
  
- **Tareas**:
  - [ ] Crear sección en README: "Instalar Drivers MCC"
  - [ ] Pasos detallados:
    ```bash
    git clone https://github.com/warrenjasper/Linux_Drivers
    cd Linux_Drivers/USB/python
    sudo make install
    test-usb5203 -ch 0 -type K  # Validar
    ```
  - [ ] Troubleshooting comun:
    - USB device not found
    - Permission denied
    - Command not found
  - [ ] Link a documentación oficial

- **Entregable**: Sección "Installation > Drivers MCC" en README

- **Checklist de Aceptación**:
  - ✅ Pasos claros y reproducibles
  - ✅ Comando de validación incluído
  - ✅ Links útiles presentes
  - ✅ Troubleshooting para problemas comunes

- **Dependencias**: Ninguna
- **Recomendado después de**: #7

---

## 🟠 ALTOS (Sprint 2 - 2 semanas)

### Issue #9: Implementar autenticación JWT
- **Prioridad**: ALTO
- **Estimación**: 8 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - API completamente abierta (sin autenticación)
  - Endpoints críticos: `/api/fuente/*`, `/api/experiment/*`, `/api/relays/*`
  - Riesgo: Cualquiera puede controlar hardware remoto
  
- **Requerimientos**:
  - Endpoint `/auth/login` (username/password)
  - JWT token generation
  - Token validation en endpoints protegidos
  - Token refresh
  - Admin + User roles (opcional)

- **Tareas**:
  - [ ] Agregar librerías: `pip install flask-jwt-extended`
  - [ ] Crear modelo User (simplificado)
  - [ ] Implementar `/auth/login`
  - [ ] Crear decorator `@token_required`
  - [ ] Proteger endpoints: `/api/fuente/*`, `/api/relays/*`, `/api/experiment/*`
  - [ ] Mantener `/api/status` y `/api/daq/*` públicos (lectura)
  - [ ] Tests unitarios para auth

- **Checklist de Aceptación**:
  - ✅ Login retorna JWT token
  - ✅ Endpoints protegidos requieren token
  - ✅ Token expirado rechazado
  - ✅ Token inválido retorna 401
  - ✅ Frontend puede hacer login y guardar token

- **Dependencias**: #1, #5

---

### Issue #10: Implementar logging estructurado (JSON)
- **Prioridad**: ALTO
- **Estimación**: 6 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Logs de texto sin estructura → difíciles de parsear
  - No es posible enviar a ELK, Datadog, CloudWatch
  
- **Requerimientos**:
  - Logs en JSON con timestamp, nivel, mensaje, contexto
  - Configuración por módulo
  - Output a stdout + archivo
  - Integración con Prometheus

- **Tareas**:
  - [ ] Instalar `python-json-logger`
  - [ ] Configurar logging en `config.py`
  - [ ] Actualizar todos los `logger.info/error/warning`
  - [ ] Agregar contexto relevante: experiment_id, channel, voltage, etc.
  - [ ] Testear: `tail -f logs/app.log | jq .`

- **Entregable**: Sistema de logging estructurado JSON

- **Checklist de Aceptación**:
  - ✅ Logs en JSON formateados
  - ✅ Campos standard: timestamp, level, message, module
  - ✅ Campos custom: experiment_id, voltage, temperature, etc.
  - ✅ Parseable con `jq` o similar
  - ✅ Configuración por ENV

- **Dependencias**: #1

---

### Issue #11: Agregar Prometheus metrics
- **Prioridad**: ALTO
- **Estimación**: 6 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin observabilidad de rendimiento
  - No hay visibilidad de eventos del sistema
  
- **Métricas a implementar**:
  - `experiments_total` (Counter)
  - `experiment_duration_seconds` (Histogram)
  - `temperature_celsius` (Gauge, por canal)
  - `api_request_duration_seconds` (Histogram)
  - `api_request_errors_total` (Counter)
  - `connection_status` (Gauge, fuente/daq/relays)

- **Tareas**:
  - [ ] Instalar `prometheus-client`
  - [ ] Implementar métricas en `labpipanel.py`
  - [ ] Exponer endpoint `/metrics` en puerto 9090
  - [ ] Decoradores para request duration
  - [ ] Agregar step en docker-compose (Prometheus)

- **Entregable**: Endpoint `/metrics` funcional

- **Checklist de Aceptación**:
  - ✅ Endpoint `/metrics` accesible
  - ✅ Métricas contienen datos válidos
  - ✅ Formato Prometheus válido
  - ✅ Incluidas en docker-compose

- **Dependencias**: #1, #7

---

### Issue #12: Crear tests de integración (pytest)
- **Prioridad**: ALTO
- **Estimación**: 12 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin pruebas de flujos completos
  - No hay validación de interacción entre módulos
  
- **Flujos a testear**:
  1. Conectar fuente → Setear voltaje → Leer voltaje
  2. Leer todos los canales DAQ (con mocks)
  3. Activar relé → Verificar estado
  4. Flujo completo experimento (mock hardware)
  5. API endpoints (Flask test client)

- **Tareas**:
  - [ ] Crear `tests/integration/` directory
  - [ ] Test fuente integration (mock Telnet)
  - [ ] Test DAQ integration (mock MCC)
  - [ ] Test relays (mock GPIO)
  - [ ] Test experimento completo
  - [ ] Test API endpoints

- **Entregable**: Suite de tests integración (30+ cases)

- **Checklist de Aceptación**:
  - ✅ Todos los flujos principales cubiertos
  - ✅ Tests pasan en CI/CD
  - ✅ Mocks funcionan correctamente
  - ✅ Coverage > 75%

- **Dependencias**: #5

---

### Issue #13: Crear docker-compose.yml completo
- **Prioridad**: ALTO
- **Estimación**: 3 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin orquestación de servicios
  - Difícil correr todo junto (backend + frontend)
  
- **Servicios a incluir**:
  - labpipanel (main app)
  - nginx (reverse proxy, opcional)
  - prometheus (metrics, opcional)
  - grafana (dashboards, opcional)

- **Tareas**:
  - [ ] Crear `docker-compose.yml` (ver en auditoría)
  - [ ] Definir volumes para logs/results
  - [ ] Health checks para cada servicio
  - [ ] Network isolation
  - [ ] Environment variables
  - [ ] Testear: `docker-compose up -d && docker-compose ps`

- **Entregable**: `docker-compose.yml` productivo

- **Checklist de Aceptación**:
  - ✅ Todos los servicios inician correctamente
  - ✅ Health checks pasan
  - ✅ Logs accesibles via `docker-compose logs`
  - ✅ Volúmenes persistidos
  - ✅ YAML válido

- **Dependencias**: #7

---

## 🟡 MEDIANOS (Sprint 3 - 2 semanas)

### Issue #14: Upgrade a Next.js 17
- **Prioridad**: MEDIO
- **Estimación**: 4 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Next.js 16 EOL: Febrero 2025
  - Necesario upgrade para soporte continuo
  
- **Tareas**:
  - [ ] Leer breaking changes: https://nextjs.org/docs/upgrading
  - [ ] Update: `npm install next@17`
  - [ ] Validar build: `npm run build`
  - [ ] Testear: `npm run dev`
  - [ ] Resolver cualquier warning/error
  - [ ] Update otros packages si es necesario

- **Checklist de Aceptación**:
  - ✅ Build sin errores
  - ✅ Dev server inicia correctamente
  - ✅ UI funciona igual
  - ✅ No hay warnings de deprecation

- **Dependencias**: #2

---

### Issue #15: Crear tests E2E con Playwright
- **Prioridad**: MEDIO
- **Estimación**: 12 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Sin pruebas end-to-end (UI completa)
  - No hay validación de flujos de usuario
  
- **Flujos a testear**:
  1. Cargar página principal
  2. Visualizar estado del sistema
  3. Cambiar voltaje de la fuente
  4. Leer temperaturas
  5. Iniciar experimento
  6. Monitorear progreso
  7. Exportar datos

- **Tareas**:
  - [ ] Instalar Playwright: `npm install -D @playwright/test`
  - [ ] Crear `tests/e2e/` directory
  - [ ] Escribir tests para cada flujo
  - [ ] Configurar `playwright.config.ts`
  - [ ] Tests en headless + headed mode
  - [ ] Screenshots en caso de error

- **Entregable**: Suite E2E (10+ tests)

- **Checklist de Aceptación**:
  - ✅ Todos los tests pasan
  - ✅ Screenshots generadas en fallos
  - ✅ Reportes HTML accesibles
  - ✅ CI/CD incluye E2E tests

- **Dependencias**: #2, #5, #9

---

### Issue #16: Crear Grafana dashboards
- **Prioridad**: MEDIO
- **Estimación**: 8 horas
- **Status**: ⬜ NOT STARTED
- **Description**: 
  - Métricas sin visualización
  - Difícil monitorear estado en tiempo real
  
- **Dashboards a crear**:
  1. Overview: Uptime, requests, errors
  2. Temperature trends: Gráficos por canal
  3. Experiment status: Power levels, durations
  4. Hardware health: Conexión fuente/daq/relays

- **Tareas**:
  - [ ] Grafana en docker-compose
  - [ ] Conectar Prometheus como data source
  - [ ] Crear dashboards JSON
  - [ ] Guardar dashboards como code (provisioning)

- **Entregable**: 4 dashboards Grafana productivos

- **Checklist de Aceptación**:
  - ✅ Dashboards en Grafana
  - ✅ Datos reales de Prometheus
  - ✅ Gráficos legibles
  - ✅ Alerts configuradas (opcional)

- **Dependencias**: #11, #13

---

## 🟢 BAJOS (Sprint 4+)

### Issue #17: Performance optimization
- **Prioridad**: BAJO
- **Estimación**: 8 horas
- **Description**: 
  - Optimizar tiempo de carga de Frontend
  - Reducir latencia de API

- **Acciones**:
  - [ ] Image optimization (next/image)
  - [ ] Code splitting
  - [ ] Bundle analysis
  - [ ] Database indexing (cuando se agregue DB)
  - [ ] Caching strategies

---

### Issue #18: Load testing (k6 o Apache JMeter)
- **Prioridad**: BAJO
- **Estimación**: 8 horas
- **Description**: 
  - Validar que sistema soporta carga esperada
  - Identificar bottlenecks

- **Tests**:
  - 100 concurrent users
  - 1000 requests/segundo
  - Duración: 5 minutos

---

### Issue #19: Multi-instance deployment
- **Prioridad**: BAJO
- **Estimación**: 16 horas
- **Description**: 
  - Soportar múltiples Raspberry Pi
  - Load balancing
  - Shared data storage

---

## ⚡ QUICK WINS (< 1 hora)

- [ ] #20: Agregar `if __name__ == "__main__"` guard en `labpipanel.py`
- [ ] #21: Crear `.gitignore` mejorado (`venv/`, `*.pyc`, `node_modules/`, `logs/`)
- [ ] #22: Agregar badges en README (tests, coverage, docker)
- [ ] #23: Crear `CONTRIBUTING.md` con guía de contribuciones
- [ ] #24: Crear `Makefile` con targets útiles
- [ ] #25: Agregar docstrings a todas las funciones públicas
- [ ] #26: Crear `CHANGELOG.md`
- [ ] #27: Agregar license (MIT) + `LICENSE` file

---

## DEPENDENCIAS ENTRE ISSUES

```
#1, #2, #3, #4 (Setup)
    ↓
    └─→ #5 (Tests)
         ↓
         └─→ #6 (CI/CD)
              ↓
              ├─→ #7 (Docker)
              │    ├─→ #8 (Drivers docs)
              │    └─→ #13 (docker-compose)
              │
              ├─→ #9 (JWT Auth)
              ├─→ #10 (Logging)
              ├─→ #11 (Prometheus)
              └─→ #12 (Integration tests)
```

---

## ROADMAP RECOMENDADO

### Week 1-2: Fundamentos
- [ ] #1, #2, #3, #4: Setup y configuración
- [ ] #20, #21: Quick wins

### Week 3-4: Testing y CI/CD
- [ ] #5: Unit tests
- [ ] #6: GitHub Actions
- [ ] #24: Makefile

### Week 5-6: Containerización y Documentación
- [ ] #7: Dockerfile
- [ ] #13: docker-compose
- [ ] #8: Drivers docs
- [ ] #23: CONTRIBUTING

### Week 7-8: Observabilidad y Seguridad
- [ ] #9: JWT Auth
- [ ] #10: Structured logging
- [ ] #11: Prometheus metrics
- [ ] #16: Grafana (opcional)

### Week 9-10: Frontend Quality
- [ ] #14: Next.js 17 upgrade
- [ ] #15: E2E tests

### Beyond
- [ ] #17, #18, #19: Performance y escalabilidad

---

**Documento de trabajo**  
**Última actualización**: Febrero 4, 2026
