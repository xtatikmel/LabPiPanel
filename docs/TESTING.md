# Guía de pruebas

## Tests automáticos del backend

```bash
cd apps/backend
pip install -r requirements-dev.txt
python -m pytest
```

Resultado esperado:

```
...............                                                          [100%]
15 passed
```

### Qué cubren

| Archivo | Cobertura |
|---|---|
| `tests/test_api_smoke.py` | `/status`, `/live-data/json`, `/config`, relés, DAQ y 404 de API |
| `tests/test_config_alerts.py` | Actualización parcial de umbrales, sincronización con `/api/config`, payload inválido |
| `tests/test_recording.py` | Inicio/parada y duración real tras `stop()` |
| `tests/test_alerts.py` | Deduplicación de alertas activas y umbrales `None` |
| `tests/test_static_serving.py` | Servido de `dist/`, fallback SPA y `503` sin build |

Los tests usan el cliente de Flask y no arrancan el loop de adquisición
(`app.config['TESTING'] = True`), por lo que son rápidos y deterministas.

### Añadir un test

1. Crea `apps/backend/tests/test_<tema>.py`.
2. Usa la fixture `client` de `conftest.py`.
3. No dependas de hardware: los drivers actuales son simulados.
4. Si mutas configuración global, la fixture `restore_global_state` la restaura
   automáticamente.

## Verificación del frontend

```bash
cd apps/frontend
npm run build
npm run lint
```

`npm run build` ejecuta `tsc -b` y falla si hay errores de tipos.

## Prueba manual de extremo a extremo

### 1. Desarrollo

```bash
# Terminal 1
cd apps/backend && python app.py

# Terminal 2
cd apps/frontend && npm run dev
```

- [ ] `http://localhost:5173` carga el dashboard.
- [ ] Los valores de temperatura/voltaje se actualizan.
- [ ] No hay errores de CORS en la consola del navegador.
- [ ] `/api/status` responde `200`.

### 2. Producción en un puerto

```bash
cd apps/frontend && npm run build
cd ../backend && python app.py
```

- [ ] `http://localhost:5000` carga la UI.
- [ ] `http://localhost:5000/assets/<archivo>.js` responde `200`.
- [ ] Una ruta como `/experimentos` devuelve el index (no 404).
- [ ] `/api/no-existe` devuelve `404` JSON.

### 3. Control y grabación

- [ ] Encender/apagar un relé y ver el cambio en `/api/relay/status`.
- [ ] Fijar voltaje dentro de rango y ver el rechazo fuera de rango.
- [ ] Iniciar grabación, esperar unos segundos, detener y comprobar que
      `elapsed_time` es mayor que 0.
- [ ] Descargar el CSV desde `/api/recording/download?filename=...`.

### 4. Alertas

- [ ] Bajar `voltage_alert.max_value` por debajo del voltaje actual.
- [ ] Verificar que aparece una alerta activa.
- [ ] Confirmar que no se duplica cada 100 ms.
- [ ] Reconocer la alerta y comprobar que desaparece de `/api/alerts/active`.

## CI sugerido

```yaml
# .github/workflows/ci.yml (ejemplo)
jobs:
  backend:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r apps/backend/requirements-dev.txt
      - run: cd apps/backend && python -m pytest

  frontend:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd apps/frontend && npm ci && npm run build
```

## Limitaciones actuales

- No hay tests de componentes React ni E2E de navegador.
- Los drivers reales no tienen tests (no se pueden ejecutar sin hardware).
- No hay tests de carga ni de concurrencia del loop de adquisición.
