# Referencia de la API

Base URL en desarrollo: `http://localhost:5000/api`
Base URL en producción: `http://<host>:5000/api`

Todas las respuestas son JSON salvo el stream SSE y la descarga de CSV.

## Convenciones

- Las peticiones `POST` envían `Content-Type: application/json`.
- Los errores de validación devuelven `400` con
  `{"success": false, "message": "..."}`.
- Los errores internos devuelven `500` con el mismo formato.
- Las rutas `/api/*` desconocidas devuelven `404` JSON.

## Estado y datos

### `GET /api/status`

```json
{
  "fuente_connected": false,
  "daq_connected": false,
  "recording": false,
  "elapsed_time": 0.0,
  "system_time": "2026-11-08T15:00:00.000000"
}
```

### `GET /api/live-data/json`

Devuelve el último dato adquirido:

```json
{
  "timestamp": "2026-11-08T15:00:00.000000",
  "elapsed_time": 12.3,
  "voltage": 5.0,
  "current": 0.42,
  "power": 2.1,
  "temperatures": [25.1, 25.0, 24.9, 30.2, 28.0, 27.8, 27.5, 22.0],
  "t_evap_avg": 25.0,
  "t_cond_avg": 27.8,
  "r_thermal": 1.33,
  "relays": [false, false, false, false],
  "recording": false,
  "fuente_connected": false,
  "daq_connected": false
}
```

### `GET /api/live-data` (SSE)

Stream `text/event-stream` a 10 Hz:

```
data: {"timestamp": "...", "voltage": 5.0, ...}

data: {...}
```

## Configuración

### `GET /api/config`

Devuelve la configuración completa (`fuente`, `daq`, `alerts`, `relay_labels`).

### `GET|POST /api/config/fuente`

Campos: `host`, `port`, `max_voltage`, `max_current`, `max_power`.

```json
POST /api/config/fuente
{"host": "192.168.1.100", "port": 5024}
```

### `GET|POST /api/config/daq`

Campos: `sample_rate`, `channel_names`, `channel_groups`, `thermocouple_type`.

```json
POST /api/config/daq
{"sample_rate": 10, "thermocouple_type": "K"}
```

### `GET|POST /api/config/relays`

```json
POST /api/config/relays
{"relay_labels": ["Compresor", "Ventilador Cond", "Ventilador Evap", "Bomba"]}
```

Debe contener exactamente 4 etiquetas.

### `GET|POST /api/config/alerts`

Umbrales: `voltage_alert`, `current_alert`, `power_alert`, `temp_evap_min`,
`temp_cond_max`, `temp_comp_max`. Cada uno admite `enabled`, `min_value` y
`max_value`.

**Semántica de actualización parcial:** los campos omitidos conservan su valor
actual. No es necesario enviar la configuración completa.

```json
POST /api/config/alerts
{
  "voltage_alert": {"max_value": 250},
  "temp_cond_max": {"enabled": true, "max_value": 75}
}
```

Los cambios se reflejan también en `GET /api/config`.

## Fuente XLN

| Método | Ruta | Cuerpo | Descripción |
|---|---|---|---|
| `POST` | `/api/fuente/connect` | `{"host"?, "port"?}` | Conecta por Telnet |
| `POST` | `/api/fuente/disconnect` | — | Desconecta |
| `GET` | `/api/fuente/status` | — | Voltaje, corriente, potencia y salida |
| `POST` | `/api/fuente/voltage` | `{"voltage": 5.0}` | Fija voltaje (0–300 V) |
| `POST` | `/api/fuente/current` | `{"current": 0.5}` | Fija corriente (0–5.2 A) |
| `POST` | `/api/fuente/output` | `{"on": true}` | Enciende/apaga la salida |

Las operaciones validan rango y potencia máxima antes de aplicar el cambio.

## Relés

| Método | Ruta | Cuerpo | Descripción |
|---|---|---|---|
| `GET` | `/api/relay/status` | — | `{"relays": [false, false, false, false]}` |
| `POST` | `/api/relay/<1-4>` | `{"on": true}` | Controla un relé |
| `POST` | `/api/relay/all` | `{"states": [true, false, false, true]}` | Controla los cuatro |

## Grabación

| Método | Ruta | Cuerpo / Query | Descripción |
|---|---|---|---|
| `POST` | `/api/recording/start` | `{"filename"?}` | Inicia grabación CSV |
| `POST` | `/api/recording/stop` | — | Detiene y devuelve `elapsed_time` |
| `POST` | `/api/recording/pause` | — | Pausa o reanuda |
| `GET` | `/api/recording/status` | — | Estado, duración y muestras |
| `GET` | `/api/recording/list` | — | Lista de CSV disponibles |
| `GET` | `/api/recording/download` | `?filename=` | Descarga un CSV |

Los archivos se guardan en `apps/backend/recordings/`.

## DAQ

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/daq/connect` | Conecta el DAQ |
| `GET` | `/api/daq/status` | `{"connected", "channels", "sample_rate"}` |
| `POST` | `/api/daq/calibrate` | Calibra los canales |

## Alertas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/alerts/active` | `{"alerts": [...]}` |
| `GET` | `/api/alerts/history?limit=50` | Historial |
| `POST` | `/api/alerts/acknowledge/<id>` | Reconoce una alerta |
| `POST` | `/api/alerts/clear` | Limpia las alertas activas |

Las alertas activas se deduplican por parámetro: mientras una condición siga
activa no se generan alertas repetidas cada 100 ms.

## Frontend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | `index.html` compilado |
| `GET` | `/<path>` | Archivo estático o fallback SPA |

Si `apps/frontend/dist` no existe, `/` devuelve `503` con
`{"success": false, "message": "Frontend no compilado..."}`.

## Ejemplo rápido

```bash
curl http://localhost:5000/api/status
curl -X POST http://localhost:5000/api/fuente/voltage \
  -H "Content-Type: application/json" \
  -d '{"voltage": 5}'
curl -X POST http://localhost:5000/api/recording/start \
  -H "Content-Type: application/json" \
  -d '{"filename": "prueba.csv"}'
```
