# Laboratorio Térmico ITM

Sistema de control y adquisición de datos para laboratorio térmico del Instituto Tecnológico Metropolitano - Medellín.

## Características

- **Control de Fuente XLN**: Conexión telnet para control de voltaje (0-300V) y corriente (0-5.2A)
- **Adquisición DAQ**: Lectura de 8 canales de termopares via USB5203
- **Control GPIO**: 4 relés para control de equipos
- **Gráficas en tiempo real**: 4 gráficas con actualización 10Hz
- **Grabación CSV**: Sistema de grabación dinámica con START/STOP/PAUSE

## Arquitectura

```
┌─────────────────┐     HTTP/SSE     ┌─────────────────┐
│   React Frontend│◄────────────────►│  Flask Backend  │
│   (Puerto 5173) │                  │   (Puerto 5000) │
└─────────────────┘                  └────────┬────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │ Fuente XLN   │          │ DAQ USB5203  │          │ GPIO Relés   │
            │ (Telnet)     │          │ (8 canales)  │          │ (4 canales)  │
            └──────────────┘          └──────────────┘          └──────────────┘
```

## Instalación

### Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
```

### Frontend (React)

```bash
npm install
```

## Uso

### Iniciar Backend

```bash
python start_server.py
```

O directamente:

```bash
cd backend
python app.py
```

### Iniciar Frontend (Desarrollo)

```bash
npm run dev
```

### Construir para Producción

```bash
npm run build
```

## API Endpoints

### Estado del Sistema
- `GET /api/status` - Estado general del sistema

### Datos en Tiempo Real
- `GET /api/live-data` - Server-Sent Events (SSE)
- `GET /api/live-data/json` - Polling JSON

### Fuente XLN
- `POST /api/fuente/connect` - Conectar via telnet
- `POST /api/fuente/disconnect` - Desconectar
- `GET /api/fuente/status` - Estado de la fuente
- `POST /api/fuente/voltage` - Establecer voltaje
- `POST /api/fuente/current` - Establecer corriente
- `POST /api/fuente/output` - Encender/apagar salida

### Relés GPIO
- `GET /api/relay/status` - Estado de relés
- `POST /api/relay/<id>` - Controlar relé (1-4)
- `POST /api/relay/all` - Controlar todos

### Grabación
- `POST /api/recording/start` - Iniciar grabación CSV
- `POST /api/recording/stop` - Detener grabación
- `POST /api/recording/pause` - Pausar/reanudar
- `GET /api/recording/status` - Estado de grabación
- `GET /api/recording/download` - Descargar CSV
- `GET /api/recording/list` - Listar archivos

## Configuración

### Fuente XLN
- IP: `192.168.1.100`
- Puerto: `10001`
- Voltaje máximo: `300V`
- Corriente máxima: `5.2A`
- Potencia máxima: `1500W`

### DAQ USB5203
- 8 canales de termopares tipo T
- Frecuencia de muestreo: 10 Hz
- Resolución: 0.1°C

### GPIO Relés
- Relé 1: Compresor
- Relé 2: Ventilador Condensador
- Relé 3: Ventilador Evaporador
- Relé 4: Bomba

## Identidad Visual ITM

- **Color primario**: `#002060` (Azul marino)
- **Color secundario**: `#E74C3C` (Rojo carmesí)
- **Color éxito**: `#27AE60` (Verde)
- **Fondo**: `#F5F5F5` (Gris claro)
- **Tipografía**: Roboto, Segoe UI

## Licencia

Instituto Tecnológico Metropolitano - Medellín, Colombia
