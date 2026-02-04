# Documentación de API REST - LabPiPanel

API REST para control de instrumentación de laboratorio térmico.

**Base URL**: `http://<IP_RASPBERRY>:5000/api`

## Índice de Endpoints

1. [Estado del Sistema](#estado-del-sistema)
2. [Control de Fuente](#control-de-fuente)
3. [Adquisición de Datos](#adquisición-de-datos)
4. [Control de Relés](#control-de-relés)
5. [Experimentos](#experimentos)

---

## Estado del Sistema

### GET /api/status

Obtiene el estado general del sistema y de todos los instrumentos.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.123456",
  "system": {
    "fuente": "connected",
    "daq": "ready",
    "relays": {
      "RELAY_1": false,
      "RELAY_2": false,
      "RELAY_3": false,
      "RELAY_4": false
    },
    "experiment": {
      "running": false,
      "last_experiment": null
    }
  }
}
\`\`\`

---

## Control de Fuente

### GET /api/fuente/voltage

Obtiene el voltaje configurado de la fuente.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "voltage": 50.0
}
\`\`\`

### POST /api/fuente/voltage

Configura el voltaje de salida de la fuente.

**Body**

\`\`\`json
{
  "voltage": 50.0,
  "confirm": false
}
\`\`\`

**Parámetros**
- `voltage` (float, required): Voltaje en voltios (0-300V)
- `confirm` (bool, optional): Confirmación para voltajes >50V

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "voltage_set": 50.0
}
\`\`\`

**Respuesta Advertencia (200)**

\`\`\`json
{
  "status": "warning",
  "message": "Voltaje alto (100V). Confirmar operación.",
  "require_confirm": true
}
\`\`\`

**Respuesta Error (400)**

\`\`\`json
{
  "status": "error",
  "message": "Voltaje debe estar entre 0 y 300V"
}
\`\`\`

---

### GET /api/fuente/current

Obtiene la corriente límite configurada.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "current": 2.5
}
\`\`\`

### POST /api/fuente/current

Configura la corriente límite de la fuente.

**Body**

\`\`\`json
{
  "current": 2.5
}
\`\`\`

**Parámetros**
- `current` (float, required): Corriente en amperios (0-5.2A)

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "current_set": 2.5
}
\`\`\`

---

### GET /api/fuente/output

Obtiene el estado de la salida de la fuente.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "output_state": "on"
}
\`\`\`

### POST /api/fuente/output

Activa o desactiva la salida de la fuente.

**Body**

\`\`\`json
{
  "state": "on"
}
\`\`\`

**Parámetros**
- `state` (string, required): Estado deseado ("on" o "off")

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "output_state": "on"
}
\`\`\`

---

### GET /api/fuente/measure

Mide voltaje y corriente actual de la salida.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "voltage": 50.12,
  "current": 2.456,
  "power": 123.09
}
\`\`\`

---

### GET /api/fuente/protections

Verifica el estado de las protecciones de la fuente.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "protections": {
    "ovp": false,
    "ocp": false,
    "opp": false,
    "status": "ok"
  }
}
\`\`\`

**Protecciones Activas**

\`\`\`json
{
  "status": "ok",
  "protections": {
    "ovp": true,
    "ocp": false,
    "opp": false,
    "status": "ovp_active"
  }
}
\`\`\`

---

## Adquisición de Datos

### GET /api/daq/read

Lee temperaturas de todos los canales del DAQ.

**Query Parameters**
- `channels` (int[], optional): Lista de canales específicos a leer

**Ejemplo**: `/api/daq/read?channels=0&channels=1&channels=2`

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.123456",
  "temperatures": {
    "ch0": 25.34,
    "ch1": 26.12,
    "ch2": 25.89,
    "ch3": 26.45,
    "ch4": 22.10,
    "ch5": 21.98,
    "ch6": 22.34,
    "ch7": 22.01
  },
  "averages": {
    "evaporator": 25.95,
    "condenser": 22.11
  }
}
\`\`\`

---

## Control de Relés

### GET /api/relay/{relay_name}

Obtiene el estado de un relé específico.

**Parámetros de Ruta**
- `relay_name` (string, required): Nombre del relé (RELAY_1, RELAY_2, RELAY_3, RELAY_4)

**Ejemplo**: `/api/relay/RELAY_1`

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "relay": "RELAY_1",
  "state": "active"
}
\`\`\`

---

### POST /api/relay/{relay_name}

Controla un relé específico.

**Body**

\`\`\`json
{
  "action": "on"
}
\`\`\`

**Parámetros**
- `action` (string, required): Acción a realizar ("on", "off", "toggle")

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "relay": "RELAY_1",
  "state": "active"
}
\`\`\`

---

### GET /api/relay/all

Obtiene el estado de todos los relés.

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "relays": {
    "RELAY_1": "active",
    "RELAY_2": "inactive",
    "RELAY_3": "inactive",
    "RELAY_4": "inactive"
  }
}
\`\`\`

---

## Experimentos

### POST /api/experiment/run

Inicia un experimento térmico automatizado.

**Body**

\`\`\`json
{
  "power_levels": [1.0, 2.0, 3.0],
  "duration": 600,
  "sample_rate": 60,
  "resistance": 10.0,
  "enable_pump": true
}
\`\`\`

**Parámetros**
- `power_levels` (float[], optional): Niveles de potencia en vatios (default: [1.0, 2.0, 3.0])
- `duration` (int, optional): Duración por nivel en segundos (default: 600)
- `sample_rate` (int, optional): Intervalo entre muestras en segundos (default: 60)
- `resistance` (float, optional): Resistencia de carga en ohmios (default: 10.0)
- `enable_pump` (bool, optional): Activar bomba de fluido (default: true)

**Respuesta Exitosa (200)**

\`\`\`json
{
  "status": "ok",
  "message": "Experimento iniciado",
  "parameters": {
    "power_levels": [1.0, 2.0, 3.0],
    "duration_per_level": 600,
    "sample_rate": 60,
    "resistance": 10.0,
    "enable_pump": true
  }
}
\`\`\`

**Respuesta Error (400)**

\`\`\`json
{
  "status": "error",
  "message": "Ya hay un experimento en ejecución"
}
\`\`\`

---

### GET /api/experiment/status

Obtiene el estado del experimento actual o último experimento ejecutado.

**Respuesta - Experimento en Ejecución (200)**

\`\`\`json
{
  "status": "ok",
  "experiment": {
    "running": true,
    "experiment": {
      "status": "in_progress",
      "name": "thermal_experiment_20240115_103000",
      "csv_file": "/home/pi/LabPiPanel/results/thermal_experiment_20240115_103000.csv",
      "power_levels": [1.0, 2.0, 3.0],
      "samples_collected": 15,
      "errors": []
    }
  }
}
\`\`\`

**Respuesta - Experimento Completado (200)**

\`\`\`json
{
  "status": "ok",
  "experiment": {
    "running": false,
    "last_experiment": {
      "status": "completed",
      "name": "thermal_experiment_20240115_103000",
      "csv_file": "/home/pi/LabPiPanel/results/thermal_experiment_20240115_103000.csv",
      "power_levels": [1.0, 2.0, 3.0],
      "samples_collected": 30,
      "total_time": "1800.45s",
      "errors": []
    }
  }
}
\`\`\`

---

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **400 Bad Request**: Parámetros inválidos o fuera de rango
- **404 Not Found**: Endpoint o recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Manejo de Errores

Todas las respuestas de error siguen el formato:

\`\`\`json
{
  "status": "error",
  "message": "Descripción del error"
}
\`\`\`

Los errores también se registran en `logs/app.log` con información detallada para troubleshooting.

---

**Instituto Tecnológico Metropolitano (ITM)**  
Medellín, Colombia  
2024
