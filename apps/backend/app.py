"""
Laboratorio Térmico ITM - Sistema de Control
Instituto Tecnológico Metropolitano - Medellín
Flask Backend Server v1.0
"""

from flask import Flask, jsonify, request, Response, send_from_directory
from flask_cors import CORS
import copy
import threading
import time
import json
import logging
import os
from datetime import datetime
from dataclasses import asdict
from pathlib import Path

from hardware_factory import get_daq_reader, get_fuente_xln, get_gpio_controller
from recording.recording_manager import RecordingManager
from alerts.alert_manager import AlertManager
from models.data_models import LiveData, SystemStatus, SystemConfig, FuenteConfig, DAQConfig

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rutas del proyecto
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

# Configurar Flask para servir el frontend compilado (apps/frontend/dist)
app = Flask(__name__, static_folder=None)
CORS(app)

# Instancias de hardware (demo o real según HARDWARE_REAL)
# El hardware_factory detecta la variable de entorno y retorna
# drivers simulados (default) o reales (si HARDWARE_REAL=true).
daq = get_daq_reader()
fuente = get_fuente_xln()
gpio = get_gpio_controller()
recorder = RecordingManager()
alert_manager = AlertManager()

# Configuración del sistema
system_config = SystemConfig()

# Estado global del sistema
system_status = SystemStatus()
data_lock = threading.Lock()
current_data = LiveData()

# Thread de adquisición de datos
data_thread = None
thread_running = False


def data_acquisition_loop():
    """Loop continuo de adquisición de datos (100ms)"""
    global current_data, thread_running
    
    logger.info("Iniciando thread de adquisición de datos")
    
    while thread_running:
        try:
            start_time = time.time()
            
            # Leer datos del DAQ (8 canales)
            temps = daq.read_all_channels()
            
            # Leer estado de la fuente
            voltage, current = fuente.get_voltage_current()
            power = voltage * current
            
            # Calcular temperaturas promedio según configuración de canales
            def avg_for_group(indices):
                valid = [temps[i] for i in indices if 0 <= i < len(temps)]
                return sum(valid) / len(valid) if valid else 0.0

            channel_groups = system_config.daq.channel_groups
            t_evap_avg = avg_for_group(channel_groups.get("evaporador", []))
            t_cond_avg = avg_for_group(channel_groups.get("condensador", []))
            
            # Calcular resistencia térmica
            delta_t = abs(t_cond_avg - t_evap_avg)
            r_thermal = delta_t / power if power > 0.1 else 0.0
            
            # Estado de relés
            relays = gpio.get_all_states()
            
            # Timestamp
            timestamp = datetime.now()
            
            with data_lock:
                current_data = LiveData(
                    timestamp=timestamp.isoformat(),
                    elapsed_time=recorder.get_elapsed_time(),
                    voltage=voltage,
                    current=current,
                    power=power,
                    temperatures=temps,
                    t_evap_avg=t_evap_avg,
                    t_cond_avg=t_cond_avg,
                    r_thermal=r_thermal,
                    relays=relays,
                    recording=recorder.is_recording,
                    fuente_connected=fuente.is_connected(),
                    daq_connected=daq.is_connected()
                )
            
            # Verificar alertas
            alert_manager.check_data(current_data)
            
            # Grabar si está activo
            if recorder.is_recording:
                recorder.write_data(current_data)
            
            # Mantener frecuencia de 10Hz (100ms)
            elapsed = time.time() - start_time
            sleep_time = max(0, 0.1 - elapsed)
            time.sleep(sleep_time)
            
        except Exception as e:
            logger.error(f"Error en adquisición: {e}")
            time.sleep(0.1)
    
    logger.info("Thread de adquisición detenido")


# ==================== CONFIGURACIÓN ====================

@app.route('/api/config', methods=['GET'])
def get_config():
    """Obtener configuración completa del sistema"""
    return jsonify(asdict(system_config))


@app.route('/api/config/fuente', methods=['GET', 'POST'])
def config_fuente():
    """Obtener/actualizar configuración de fuente"""
    global system_config
    
    if request.method == 'GET':
        return jsonify(asdict(system_config.fuente))
    
    try:
        data = request.get_json()
        if 'host' in data:
            system_config.fuente.host = data['host']
        if 'port' in data:
            system_config.fuente.port = int(data['port'])
        if 'max_voltage' in data:
            system_config.fuente.max_voltage = float(data['max_voltage'])
        if 'max_current' in data:
            system_config.fuente.max_current = float(data['max_current'])
        if 'max_power' in data:
            system_config.fuente.max_power = float(data['max_power'])
        
        return jsonify({'success': True, 'config': asdict(system_config.fuente)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/config/daq', methods=['GET', 'POST'])
def config_daq():
    """Obtener/actualizar configuración de DAQ"""
    global system_config
    
    if request.method == 'GET':
        return jsonify(asdict(system_config.daq))
    
    try:
        data = request.get_json()
        if 'sample_rate' in data:
            system_config.daq.sample_rate = float(data['sample_rate'])
        if 'channel_names' in data:
            system_config.daq.channel_names = data['channel_names']
        if 'channel_groups' in data:
            system_config.daq.channel_groups = data['channel_groups']
        if 'thermocouple_type' in data:
            system_config.daq.thermocouple_type = data['thermocouple_type']
        
        return jsonify({'success': True, 'config': asdict(system_config.daq)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/config/relays', methods=['GET', 'POST'])
def config_relays():
    """Obtener/actualizar etiquetas de relés"""
    global system_config

    if request.method == 'GET':
        return jsonify({'relay_labels': system_config.relay_labels})

    try:
        data = request.get_json()
        labels = data.get('relay_labels', [])
        if not isinstance(labels, list) or len(labels) != 4:
            return jsonify({'success': False, 'message': 'relay_labels debe tener 4 elementos'}), 400

        system_config.relay_labels = labels
        return jsonify({'success': True, 'relay_labels': system_config.relay_labels})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/config/alerts', methods=['GET', 'POST'])
def config_alerts():
    """Obtener/actualizar configuración de alertas"""
    global system_config

    if request.method == 'GET':
        return jsonify(asdict(alert_manager.get_config()))

    try:
        data = request.get_json() or {}

        # Partimos de la configuración actual para que un POST parcial no
        # reinicie los umbrales que no se envían.
        new_config = copy.deepcopy(alert_manager.get_config())

        if 'enabled' in data:
            new_config.enabled = bool(data['enabled'])
        if 'sound_enabled' in data:
            new_config.sound_enabled = bool(data['sound_enabled'])

        # Actualizar umbrales individuales
        for key in ['voltage_alert', 'current_alert', 'power_alert',
                    'temp_evap_min', 'temp_cond_max', 'temp_comp_max']:
            if key not in data:
                continue

            threshold_data = data[key] or {}
            threshold = getattr(new_config, key)
            if 'enabled' in threshold_data:
                threshold.enabled = bool(threshold_data['enabled'])
            if 'min_value' in threshold_data:
                threshold.min_value = float(threshold_data['min_value']) if threshold_data['min_value'] is not None else None
            if 'max_value' in threshold_data:
                threshold.max_value = float(threshold_data['max_value']) if threshold_data['max_value'] is not None else None

        alert_manager.set_config(new_config)
        # Mantener una única fuente de verdad: /api/config también debe
        # reflejar los cambios hechos desde /api/config/alerts.
        system_config.alerts = new_config

        return jsonify({'success': True, 'config': asdict(new_config)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


# ==================== ALERTAS ====================

@app.route('/api/alerts/active', methods=['GET'])
def get_active_alerts():
    """Obtener alertas activas"""
    alerts = alert_manager.get_active_alerts()
    return jsonify({'alerts': [asdict(a) for a in alerts]})


@app.route('/api/alerts/history', methods=['GET'])
def get_alert_history():
    """Obtener historial de alertas"""
    limit = request.args.get('limit', 50, type=int)
    alerts = alert_manager.get_alert_history(limit)
    return jsonify({'alerts': [asdict(a) for a in alerts]})


@app.route('/api/alerts/acknowledge/<alert_id>', methods=['POST'])
def acknowledge_alert(alert_id):
    """Reconocer una alerta"""
    success = alert_manager.acknowledge_alert(alert_id)
    return jsonify({'success': success})


@app.route('/api/alerts/clear', methods=['POST'])
def clear_all_alerts():
    """Limpiar todas las alertas"""
    alert_manager.clear_all_alerts()
    return jsonify({'success': True})


# ==================== ESTADO Y DATOS ====================

@app.route('/api/status', methods=['GET'])
def get_status():
    """Obtener estado del sistema"""
    return jsonify({
        'fuente_connected': fuente.is_connected(),
        'daq_connected': daq.is_connected(),
        'recording': recorder.is_recording,
        'elapsed_time': recorder.get_elapsed_time(),
        'system_time': datetime.now().isoformat()
    })


@app.route('/api/live-data')
def live_data_sse():
    """Server-Sent Events para datos en tiempo real"""
    def generate():
        while True:
            with data_lock:
                data = asdict(current_data)
            yield f"data: {json.dumps(data)}\n\n"
            time.sleep(0.1)  # 10Hz update rate
    
    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    )


@app.route('/api/live-data/json', methods=['GET'])
def live_data_json():
    """Obtener datos actuales como JSON (para polling)"""
    with data_lock:
        data = asdict(current_data)
    return jsonify(data)


# ==================== FUENTE XLN ====================

@app.route('/api/fuente/connect', methods=['POST'])
def fuente_connect():
    """Conectar a fuente XLN por telnet"""
    try:
        data = request.get_json() or {}
        host = data.get('host', system_config.fuente.host)
        port = data.get('port', system_config.fuente.port)
        
        success = fuente.connect(host, port)
        return jsonify({'success': success, 'message': 'Conectado' if success else 'Error de conexión'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/fuente/disconnect', methods=['POST'])
def fuente_disconnect():
    """Desconectar fuente XLN"""
    fuente.disconnect()
    return jsonify({'success': True, 'message': 'Desconectado'})


@app.route('/api/fuente/status', methods=['GET'])
def fuente_status():
    """Obtener estado de la fuente"""
    voltage, current = fuente.get_voltage_current()
    return jsonify({
        'connected': fuente.is_connected(),
        'voltage': voltage,
        'current': current,
        'power': voltage * current,
        'output_on': fuente.is_output_on()
    })


@app.route('/api/fuente/voltage', methods=['POST'])
def set_voltage():
    """Establecer voltaje (0-300V)"""
    try:
        data = request.get_json()
        voltage = float(data.get('voltage', 0))
        
        # Validación
        if not 0 <= voltage <= system_config.fuente.max_voltage:
            return jsonify({'success': False, 'message': f'Voltaje fuera de rango (0-{system_config.fuente.max_voltage}V)'}), 400
        
        # Validar potencia
        current = fuente.get_current_setpoint()
        if voltage * current > system_config.fuente.max_power:
            return jsonify({'success': False, 'message': f'Potencia excede {system_config.fuente.max_power}W'}), 400
        
        success = fuente.set_voltage(voltage)
        return jsonify({'success': success, 'voltage': voltage})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/fuente/current', methods=['POST'])
def set_current():
    """Establecer corriente (0-5.2A)"""
    try:
        data = request.get_json()
        current = float(data.get('current', 0))
        
        # Validación
        if not 0 <= current <= system_config.fuente.max_current:
            return jsonify({'success': False, 'message': f'Corriente fuera de rango (0-{system_config.fuente.max_current}A)'}), 400
        
        # Validar potencia
        voltage = fuente.get_voltage_setpoint()
        if voltage * current > system_config.fuente.max_power:
            return jsonify({'success': False, 'message': f'Potencia excede {system_config.fuente.max_power}W'}), 400
        
        success = fuente.set_current(current)
        return jsonify({'success': success, 'current': current})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/fuente/output', methods=['POST'])
def set_output():
    """Encender/apagar salida de la fuente"""
    try:
        data = request.get_json()
        state = bool(data.get('on', False))
        success = fuente.set_output(state)
        return jsonify({'success': success, 'output_on': state})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== RELÉS GPIO ====================

@app.route('/api/relay/status', methods=['GET'])
def relay_status():
    """Obtener estado de todos los relés"""
    return jsonify({'relays': gpio.get_all_states()})


@app.route('/api/relay/<int:relay_id>', methods=['POST'])
def set_relay(relay_id):
    """Controlar relé individual (1-4)"""
    try:
        if not 1 <= relay_id <= 4:
            return jsonify({'success': False, 'message': 'Relé debe ser 1-4'}), 400
        
        data = request.get_json()
        state = bool(data.get('on', False))
        
        success = gpio.set_relay(relay_id, state)
        return jsonify({
            'success': success,
            'relay_id': relay_id,
            'state': state
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/relay/all', methods=['POST'])
def set_all_relays():
    """Controlar todos los relés"""
    try:
        data = request.get_json()
        states = data.get('states', [False, False, False, False])
        success = gpio.set_all_relays(states)
        return jsonify({'success': success, 'states': states})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== GRABACIÓN ====================

@app.route('/api/recording/start', methods=['POST'])
def recording_start():
    """Iniciar grabación a CSV"""
    try:
        data = request.get_json() or {}
        filename = data.get('filename')
        
        success = recorder.start(filename)
        return jsonify({
            'success': success,
            'recording': recorder.is_recording,
            'filename': recorder.filename,
            'message': 'Grabación iniciada' if success else 'Error al iniciar grabación'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/recording/stop', methods=['POST'])
def recording_stop():
    """Detener grabación"""
    try:
        success = recorder.stop()
        return jsonify({
            'success': success,
            'recording': recorder.is_recording,
            'filename': recorder.filename,
            'elapsed_time': recorder.get_elapsed_time(),
            'message': 'Grabación detenida'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/recording/pause', methods=['POST'])
def recording_pause():
    """Pausar/reanudar grabación"""
    try:
        success = recorder.pause()
        return jsonify({
            'success': success,
            'recording': recorder.is_recording,
            'paused': recorder.is_paused,
            'message': 'Grabación pausada' if recorder.is_paused else 'Grabación reanudada'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/recording/status', methods=['GET'])
def recording_status():
    """Obtener estado de grabación"""
    return jsonify({
        'recording': recorder.is_recording,
        'paused': recorder.is_paused,
        'filename': recorder.filename,
        'elapsed_time': recorder.get_elapsed_time(),
        'samples_recorded': recorder.samples_recorded
    })


@app.route('/api/recording/download', methods=['GET'])
def recording_download():
    """Descargar archivo CSV de grabación"""
    try:
        filename = request.args.get('filename')
        csv_data = recorder.get_csv_data(filename)
        
        if csv_data is None:
            return jsonify({'success': False, 'message': 'Archivo no encontrado'}), 404
        
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename or recorder.filename}',
                'Access-Control-Allow-Origin': '*'
            }
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/recording/list', methods=['GET'])
def recording_list():
    """Listar archivos de grabación disponibles"""
    try:
        files = recorder.list_recordings()
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== DAQ ====================

@app.route('/api/daq/connect', methods=['POST'])
def daq_connect():
    """Conectar a DAQ USB5203"""
    try:
        success = daq.connect()
        return jsonify({'success': success, 'message': 'DAQ conectado' if success else 'Error de conexión'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/daq/status', methods=['GET'])
def daq_status():
    """Obtener estado del DAQ"""
    return jsonify({
        'connected': daq.is_connected(),
        'channels': 8,
        'sample_rate': system_config.daq.sample_rate
    })


@app.route('/api/daq/calibrate', methods=['POST'])
def daq_calibrate():
    """Calibrar canales del DAQ"""
    try:
        success = daq.calibrate()
        return jsonify({'success': success, 'message': 'Calibración completada'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== INICIO/CIERRE ====================

def start_acquisition():
    """Iniciar thread de adquisición"""
    global data_thread, thread_running
    
    if not thread_running:
        thread_running = True
        data_thread = threading.Thread(target=data_acquisition_loop)
        data_thread.daemon = True
        data_thread.start()
        logger.info("Thread de adquisición iniciado")


def stop_acquisition():
    """Detener thread de adquisición"""
    global thread_running
    
    thread_running = False
    if data_thread and data_thread.is_alive():
        data_thread.join(timeout=1.0)
    logger.info("Thread de adquisición detenido")


@app.before_request
def before_request():
    """Asegurar que el thread de adquisición esté corriendo"""
    global thread_running
    # En tests no arrancamos hardware (aunque sea simulado) para mantener
    # las respuestas deterministas.
    if app.config.get('TESTING'):
        return
    if not thread_running:
        start_acquisition()


# ==================== FRONTEND ====================

@app.route('/')
def serve_index():
    """Servir la aplicación React compilada"""
    index = FRONTEND_DIST / 'index.html'
    if not index.is_file():
        return jsonify({
            'success': False,
            'message': 'Frontend no compilado. Ejecuta "npm run build" en apps/frontend.'
        }), 503
    return send_from_directory(str(FRONTEND_DIST), 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Servir archivos estáticos y rutas SPA"""
    # No devolver el index para rutas de API desconocidas
    if path == 'api' or path.startswith('api/'):
        return jsonify({'success': False, 'message': 'Endpoint no encontrado'}), 404

    dist_root = FRONTEND_DIST.resolve()
    candidate = (FRONTEND_DIST / path).resolve()

    # Evitar path traversal fuera de dist/
    if dist_root not in candidate.parents and candidate != dist_root:
        return jsonify({'success': False, 'message': 'Ruta no válida'}), 404

    if candidate.is_file():
        return send_from_directory(str(FRONTEND_DIST), path)

    # Fallback SPA: cualquier ruta desconocida devuelve index.html
    index = FRONTEND_DIST / 'index.html'
    if index.is_file():
        return send_from_directory(str(FRONTEND_DIST), 'index.html')

    return jsonify({
        'success': False,
        'message': 'Frontend no compilado. Ejecuta "npm run build" en apps/frontend.'
    }), 503


if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("Laboratorio Térmico ITM - Servidor Backend")
    logger.info("Instituto Tecnológico Metropolitano - Medellín")
    logger.info("=" * 50)
    
    # Iniciar thread de adquisición
    start_acquisition()
    
    host = os.getenv('HOST', os.getenv('FLASK_HOST', '0.0.0.0'))
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', '5000')))

    try:
        app.run(host=host, port=port, debug=False, threaded=True)
    except KeyboardInterrupt:
        logger.info("Cerrando servidor...")
    finally:
        stop_acquisition()
        fuente.disconnect()
        daq.disconnect()
        logger.info("Servidor cerrado")
