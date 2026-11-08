# Arquitectura

## Vista general

```
┌─────────────────────────────────────────────────────────────┐
│                        Navegador                            │
│  React 19 + TypeScript + Vite + Tailwind                    │
│  hooks: useLiveData, useConfig, useFuente, useRelays, ...   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / SSE (/api)
┌──────────────────────────▼──────────────────────────────────┐
│                    Flask (apps/backend)                     │
│  app.py: rutas, estado global y loop de adquisición         │
│                                                             │
│  hardware/          recording/          alerts/             │
│  ├── daq_reader     ├── RecordingManager ├── AlertManager   │
│  ├── fuente_xln     └── CSV              └── umbrales       │
│  ├── gpio_controller                                        │
│  └── oled_driver                                            │
│                                                             │
│  models/data_models.py: dataclasses compartidas             │
└─────────────────────────────────────────────────────────────┘
```

En producción Flask sirve además `apps/frontend/dist`, por lo que todo queda en
un único origen y puerto (`5000`).

## Flujo de datos

1. `data_acquisition_loop()` corre en un hilo daemon y se inicia en el primer
   request (o al arrancar `app.py`).
2. Cada 100 ms:
   - lee 8 canales del DAQ,
   - lee voltaje/corriente de la fuente,
   - calcula promedios de evaporador/condensador y resistencia térmica,
   - construye un `LiveData` y lo publica bajo `data_lock`.
3. El frontend consume `/api/live-data` por SSE (con polling JSON como respaldo).
4. Si hay grabación activa, se escribe una fila CSV por muestra.
5. `AlertManager.check_data()` evalúa umbrales y genera alertas.

## Estado global del backend

`app.py` mantiene instancias únicas de:

- `daq`, `fuente`, `gpio`: drivers (hoy simulados).
- `recorder`: gestor de CSV.
- `alert_manager`: configuración y alertas.
- `system_config`: configuración del sistema en memoria.
- `current_data`: último `LiveData`, protegido por `data_lock`.

No hay persistencia: al reiniciar se pierden configuración y estado.

## Frontend

- `src/hooks/` encapsula las llamadas a la API.
- `src/lib/api.ts` resuelve la base URL:
  - `/api` por defecto (proxy de Vite en desarrollo, mismo origen en producción),
  - `VITE_API_BASE` para despliegues separados.
- `src/components/` contiene los paneles de control, configuración, alertas y
  grabación.
- `App.tsx` compone el dashboard y refresca el estado periódicamente.

## Hardware: simulación vs. realidad

| Componente | Monorepo | Raíz (legacy) |
|---|---|---|
| DAQ USB-5203 | Simulado | `daq_usb5203.py` real |
| Fuente XLN30052 | Simulado | `fuente_xln.py` real |
| Relés GPIO | Simulado | `relay_controller.py` real |
| OLED | Driver presente, no integrado | — |
| Experimentos | No implementados | `thermal_experiment.py` |

### Diferencias a corregir al portar hardware

- Puerto XLN: `10001` → `5024`.
- Termopar: tipo `T` → tipo `K`.
- Pines de relé: `17/27/22/23` → `26/20/21/16`.
- Relés activos en bajo (`GPIO.LOW = ON`).
- El driver OLED debe integrarse en el loop o en un hilo propio.

## Decisiones de diseño

- **Un solo origen en producción** para evitar CORS y simplificar el despliegue.
- **Simulación por defecto** para poder desarrollar sin instrumentación.
- **Configuración en memoria** mientras no exista un archivo persistente; es una
  limitación conocida, no un objetivo.
- **SSE** para datos en vivo; se puede migrar a WebSocket si se necesita
  bidireccionalidad.

## Deuda técnica conocida

- No hay endpoints ni UI de experimentos.
- No hay autenticación ni control de acceso.
- No hay persistencia de configuración.
- El frontend se re-renderiza completo a 10 Hz.
- Faltan tests de los drivers reales.
- La raíz legacy sigue presente y puede confundir; está documentada como
  histórica en `docs/archive/`.
