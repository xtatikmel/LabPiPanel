# CHECKLIST FINAL - AUDITORÍA TÉCNICA LabPiPanel

**Documento accionable con todas las tareas de la auditoría**

---

## ✅ PRE-AUDITORÍA (Completado)

- [x] Análisis de estructura de directorios
- [x] Lectura de manifiestos (requirements.txt, package.json, config.py)
- [x] Análisis de módulos Python
- [x] Documentación existente (API.md, HARDWARE.md, README.md)
- [x] Detección de stack tecnológico
- [x] Identificación de falencias críticas

---

## 🟦 DOCUMENTOS GENERADOS (Completado)

- [x] **AUDITORIA_TECNICA.md** (800+ líneas) - Análisis completo
- [x] **RESUMEN_EJECUTIVO.md** - Para stakeholders/directivos
- [x] **ISSUES_PRIORIZADAS.md** - 27 issues con estimaciones
- [x] **.env.example** - Plantilla variables de entorno
- [x] **Dockerfile** - Multi-stage build ARM64
- [x] **docker-compose.yml** - Orquestación servicios
- [x] **Makefile** - Targets automatizados
- [x] **requirements-dev.txt** - Deps desarrollo/testing
- [x] **scripts/install.sh** - Script instalación automática
- [x] Este checklist

---

## 🔴 SPRINT 1 - FUNDAMENTOS (PRÓXIMAS 2 SEMANAS)

**Objetivo**: Sistema reproducible con tests básicos y CI/CD

### Semana 1

#### Día 1 - Dependencias (2-3 horas)

- [ ] **Task 1.1**: Generar requirements.lock.txt
  ```bash
  pip freeze > requirements.lock.txt
  ```
  **Verificar**: Archivo creado con todas las versiones

- [ ] **Task 1.2**: Actualizar requirements.txt con versiones
  ```
  RPi.GPIO==0.7.1
  telnetlib3==1.0.4
  Flask==3.0.0
  pyusb==1.2.1
  mcculw==1.0.0
  flask-socketio==5.3.4
  eventlet==0.33.3
  pexpect==4.9.1
  python-dotenv==1.0.0
  Werkzeug==3.0.0
  ```
  **Verificar**: `pip install -r requirements.txt` sin errores

- [ ] **Task 1.3**: Generar package-lock.json
  ```bash
  rm -rf node_modules package-lock.json
  npm ci
  npm install --save-exact
  ```
  **Verificar**: `package-lock.json` existe y `npm ci` funciona

- [ ] **Task 1.4**: Crear y configurar .env
  ```bash
  cp .env.example .env
  # Editar con valores reales
  ```
  **Verificar**: Backend inicia sin errores `python3 labpipanel.py`

#### Día 2-3 - Tests Unitarios (8 horas)

- [ ] **Task 2.1**: Instalar dependencias testing
  ```bash
  pip install pytest pytest-cov pytest-mock
  ```

- [ ] **Task 2.2**: Crear estructura de tests
  ```bash
  mkdir -p tests/unit tests/integration tests/e2e
  touch tests/__init__.py tests/unit/__init__.py tests/conftest.py
  ```

- [ ] **Task 2.3**: Escribir tests para fuente_xln.py (25 casos)
  ```
  tests/unit/test_fuente_xln.py:
  - test_validate_voltage_*
  - test_validate_current_*
  - test_parse_response_*
  - test_connection_*
  - test_readback_verification_*
  ```
  **Target**: 90% coverage

- [ ] **Task 2.4**: Escribir tests para daq_usb5203.py (20 casos)
  ```
  tests/unit/test_daq_usb5203.py:
  - test_validate_channel_*
  - test_validate_thermocouple_type_*
  - test_validate_temperature_*
  - test_read_channel_*
  ```
  **Target**: 85% coverage

- [ ] **Task 2.5**: Escribir tests para relay_controller.py (15 casos)
  ```
  tests/unit/test_relay_controller.py:
  - test_activate_relay_*
  - test_deactivate_relay_*
  - test_toggle_relay_*
  - test_mock_gpio_*
  ```
  **Target**: 90% coverage

- [ ] **Task 2.6**: Escribir tests para thermal_experiment.py (15 casos)
  ```
  tests/unit/test_thermal_experiment.py:
  - test_power_calculation_*
  - test_thermal_resistance_*
  - test_csv_export_*
  ```
  **Target**: 80% coverage

- [ ] **Task 2.7**: Generar reporte de cobertura
  ```bash
  pytest tests/unit/ --cov=. --cov-report=html
  open htmlcov/index.html  # Verificar 80%+
  ```
  **Verificar**: Coverage >= 80%

#### Día 4-5 - CI/CD & Docker (10 horas)

- [ ] **Task 3.1**: Crear GitHub Actions workflow
  ```bash
  mkdir -p .github/workflows
  # Crear test-deploy.yml (ver template en auditoría)
  ```
  **Contenido**:
  - Lint (flake8)
  - Type check (mypy)
  - Tests (pytest)
  - Build Docker
  - Deploy (solo main branch)

- [ ] **Task 3.2**: Proteger main branch
  - [ ] Require all status checks to pass
  - [ ] Require PR reviews before merge

- [ ] **Task 3.3**: Construir y testear Docker
  ```bash
  docker build -t labpipanel:test .
  docker run -p 5000:5000 labpipanel:test
  curl http://localhost:5000/api/status  # Debe responder
  ```
  **Verificar**: Container inicia y API responde

- [ ] **Task 3.4**: Crear docker-compose.yml
  ```bash
  # Ya está generado, revisar y testear
  docker-compose up -d
  docker-compose ps  # Todos "Up"
  ```

- [ ] **Task 3.5**: Documentar instalación MCC drivers
  - Agregar sección en README.md
  - Incluir pasos exactos de instalación
  - Troubleshooting común

### Semana 2

#### Día 6-7 - Code Quality (6 horas)

- [ ] **Task 4.1**: Instalar herramientas linting
  ```bash
  pip install black flake8 mypy
  npm install -D eslint prettier
  ```

- [ ] **Task 4.2**: Ejecutar linting
  ```bash
  flake8 *.py tests/  # 0 errors
  black --check .     # Check formatting
  mypy *.py          # 0 errors
  npm run lint       # 0 errors
  ```

- [ ] **Task 4.3**: Agregar pre-commit hooks (opcional)
  ```bash
  pip install pre-commit
  # Crear .pre-commit-config.yaml
  pre-commit install
  ```

#### Día 8-10 - Documentation & Polish (6 horas)

- [ ] **Task 5.1**: Actualizar README.md principal
  - [ ] Secciones: descripción, requisitos, instalación, ejecución
  - [ ] API endpoints principales
  - [ ] Tests y coverage
  - [ ] Docker
  - [ ] Troubleshooting

- [ ] **Task 5.2**: Crear CONTRIBUTING.md
  - [ ] Guía de contribuciones
  - [ ] Setup para desarrolladores
  - [ ] Proceso de PR

- [ ] **Task 5.3**: Crear CHANGELOG.md
  - Versión 0.1.0 - Release inicial con tests/CI/CD

- [ ] **Task 5.4**: Validación final
  ```bash
  # Instalación limpia
  rm -rf venv node_modules
  bash scripts/install.sh
  
  # Tests
  pytest tests/unit/ -v
  npm run build
  
  # Docker
  docker-compose up -d
  curl http://localhost:5000/api/status
  ```

- [ ] **Task 5.5**: Crear release
  ```bash
  git tag -a v0.1.0 -m "Release: Initial with tests and CI/CD"
  git push origin v0.1.0
  ```

---

## 🟠 SPRINT 2 - SEGURIDAD & OBSERVABILIDAD (Semanas 3-4)

**Objetivo**: API segura con visibilidad operacional

### Tareas principales

- [ ] **Issue #9**: JWT Authentication
  - [ ] Instalar `flask-jwt-extended`
  - [ ] Crear endpoint `/auth/login`
  - [ ] Agregar decorator `@token_required`
  - [ ] Proteger endpoints críticos
  - [ ] Tests unitarios

- [ ] **Issue #10**: Structured Logging (JSON)
  - [ ] Instalar `python-json-logger`
  - [ ] Configurar logging en `config.py`
  - [ ] Tests: logs en JSON válido

- [ ] **Issue #11**: Prometheus Metrics
  - [ ] Instalar `prometheus-client`
  - [ ] Implementar métricas principales
  - [ ] Exponer endpoint `/metrics`
  - [ ] Agregar a docker-compose

- [ ] **Issue #12**: Integration Tests
  - [ ] Tests flujo fuente (connect → set voltage → readback)
  - [ ] Tests flujo DAQ (multi-channel read)
  - [ ] Tests API endpoints
  - [ ] Tests experimento completo

**Estimación**: 32 horas

---

## 🟡 SPRINT 3 - QUALITY (Semanas 5-6)

**Objetivo**: Frontend moderno con tests E2E

- [ ] **Issue #14**: Next.js 17 upgrade
- [ ] **Issue #15**: E2E tests (Playwright)
- [ ] **Issue #16**: Grafana dashboards

**Estimación**: 24 horas

---

## 🟢 SPRINTS 4+ - ESCALABILIDAD

- Load testing
- Multi-instance
- Database (PostgreSQL)
- Mobile app

---

## 📋 QUICK WINS (1 hora cada)

Tareas pequeñas para hacer en paralelo:

- [ ] **QW #1**: Agregar `if __name__ == "__main__"` en labpipanel.py
- [ ] **QW #2**: Crear .gitignore mejorado
- [ ] **QW #3**: Agregar badges en README (tests, docker, coverage)
- [ ] **QW #4**: Crear LICENSE (MIT)
- [ ] **QW #5**: Agregar docstrings a funciones públicas
- [ ] **QW #6**: Crear SECURITY.md (vulnerabilidad policy)

---

## 🧪 VALIDACIÓN FINAL (Cada Sprint)

### Checklist de Completitud

**Sprint 1 - Validar**:
- [ ] Todos los tests pasan: `pytest tests/ -v`
- [ ] Coverage >= 80%: `pytest --cov-report=term-missing`
- [ ] Linting sin errores: `flake8 *.py`
- [ ] Docker builds: `docker build -t labpipanel:latest .`
- [ ] docker-compose up -d sin errores
- [ ] API responde: `curl http://localhost:5000/api/status`
- [ ] GitHub Actions ejecuta y pasa

**Sprint 2 - Validar**:
- [ ] JWT auth funciona
- [ ] Logs en JSON formateados correctamente
- [ ] Prometheus endpoint accesible
- [ ] Integration tests pasan
- [ ] Coverage sigue siendo >= 80%

**Sprint 3 - Validar**:
- [ ] Next.js 17 build sin warnings
- [ ] E2E tests pasan
- [ ] Grafana dashboards con datos reales
- [ ] Todo el pipeline end-to-end funciona

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Target | Sprint 1 | Sprint 2 | Sprint 3 |
|---------|--------|----------|----------|----------|
| Test Coverage | 80%+ | 80% | 82% | 85% |
| Code Quality | 0 errors | ✅ | ✅ | ✅ |
| Build Time | < 5 min | ✅ | ✅ | ✅ |
| Deploy Time | < 2 min | ✅ | ✅ | ✅ |
| Security | No vulns | ❌→✅ | ✅ | ✅ |
| Observability | Logs+Metrics | ❌→⚠️ | ✅ | ✅ |
| Documentation | 100% | ✅ | ✅ | ✅ |

---

## 🚀 COMANDOS EXACTOS PARA HOY

```bash
# HORA 1: Clonar y setup
cd ~
git clone https://github.com/mutatronik-qa/LabPiPanel.git
cd LabPiPanel

# HORA 2: Dependencias Python
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip freeze > requirements.lock.txt
# Editar requirements.txt con versiones

# HORA 3: Dependencias Node
npm ci || npm install
npm install --save-exact

# HORA 4: Env y tests base
cp .env.example .env
# Editar .env si es necesario
pip install pytest pytest-cov pytest-mock

# HORA 5-6: Ejecutar primeros tests
mkdir -p tests/unit
# Escribir 10 test cases simples
pytest tests/ --cov=. --cov-report=html

# RESULTADO
✅ Sistema reproducible
✅ Tests corriendo
✅ Coverage baseline establecido
```

---

## 📞 CONTACTO Y ESCALACIÓN

Si necesitas:
- **Clarificaciones**: Ver `AUDITORIA_TECNICA.md` sección específica
- **Estimaciones detalladas**: Ver `ISSUES_PRIORIZADAS.md`
- **Decisiones arquitectónicas**: Ver `RESUMEN_EJECUTIVO.md`
- **Ejecución de tareas**: Seguir este checklist línea por línea

---

## 📅 TIMELINE RECOMENDADO

```
Febrero 4    : Publicar auditoría + crear issues
Febrero 11   : Completar Sprint 1 semana 1 (Deps + Tests)
Febrero 18   : Completar Sprint 1 semana 2 (Docker + CI/CD)
Marzo 4      : Completar Sprint 2 (Auth + Observability)
Marzo 18     : Completar Sprint 3 (Frontend + E2E)
Abril 1      : System production-ready
```

---

**Documento de Trabajo**  
**Generado**: Febrero 4, 2026  
**Actualizado**: [Tu fecha]  
**Estado**: 🟢 LISTO PARA ACCIÓN
