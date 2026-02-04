#!/usr/bin/env python3
"""
Script de inicio para el Laboratorio Térmico ITM
Inicia el servidor Flask backend
"""

import sys
import os

# Añadir backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import app, start_acquisition, stop_acquisition
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == '__main__':
    print("=" * 60)
    print("  Laboratorio Térmico ITM - Servidor Backend")
    print("  Instituto Tecnológico Metropolitano - Medellín")
    print("=" * 60)
    print()
    print("  Iniciando servidor en http://localhost:5000")
    print("  API Endpoints:")
    print("    - GET  /api/status          Estado del sistema")
    print("    - GET  /api/live-data       Datos en tiempo real (SSE)")
    print("    - GET  /api/live-data/json  Datos en tiempo real (JSON)")
    print("    - POST /api/fuente/connect  Conectar fuente")
    print("    - POST /api/fuente/voltage  Establecer voltaje")
    print("    - POST /api/fuente/current  Establecer corriente")
    print("    - POST /api/fuente/output   Controlar salida")
    print("    - POST /api/relay/<id>      Controlar relé")
    print("    - POST /api/recording/start Iniciar grabación")
    print("    - POST /api/recording/stop  Detener grabación")
    print("    - POST /api/recording/pause Pausar grabación")
    print()
    print("  Presione Ctrl+C para detener")
    print("=" * 60)
    print()
    
    try:
        start_acquisition()
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n\nCerrando servidor...")
    finally:
        stop_acquisition()
        print("Servidor detenido.")
