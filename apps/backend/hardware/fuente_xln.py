"""
Control de Fuente XLN via Telnet
Simulado para demo - En producción conectar a equipo real
"""

import logging
import time
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


class FuenteXLN:
    """Controlador de Fuente de Alimentación XLN via Telnet"""
    
    def __init__(self):
        self.host: str = "192.168.1.100"
        self.port: int = 10001
        self._connected: bool = False
        self._voltage_setpoint: float = 0.0
        self._current_setpoint: float = 0.0
        self._voltage_actual: float = 0.0
        self._current_actual: float = 0.0
        self._output_on: bool = False
        self._telnet = None
        
    def connect(self, host: str = "192.168.1.100", port: int = 10001) -> bool:
        """Conectar a la fuente via Telnet"""
        try:
            self.host = host
            self.port = port
            
            # Simulación - En producción: conexión telnet real
            # import telnetlib
            # self._telnet = telnetlib.Telnet(host, port, timeout=5)
            # self._telnet.read_until(b">", timeout=2)
            
            self._connected = True
            logger.info(f"Fuente XLN conectada: {host}:{port}")
            return True
            
        except Exception as e:
            logger.error(f"Error conectando a fuente: {e}")
            self._connected = False
            return False
    
    def disconnect(self) -> None:
        """Desconectar de la fuente"""
        if self._telnet:
            try:
                self._telnet.close()
            except:
                pass
        self._connected = False
        self._output_on = False
        logger.info("Fuente XLN desconectada")
    
    def is_connected(self) -> bool:
        """Verificar conexión"""
        return self._connected
    
    def is_output_on(self) -> bool:
        """Verificar si la salida está activa"""
        return self._output_on
    
    def set_voltage(self, voltage: float) -> bool:
        """Establecer voltaje de salida (0-300V)"""
        if not self._connected:
            logger.warning("Fuente no conectada")
            return False
        
        if not 0 <= voltage <= 300:
            logger.warning(f"Voltaje fuera de rango: {voltage}V")
            return False
        
        try:
            # Simulación - En producción: comando telnet real
            # self._telnet.write(f"VOLT {voltage:.2f}\n".encode())
            # response = self._telnet.read_until(b">", timeout=2)
            
            self._voltage_setpoint = voltage
            if self._output_on:
                self._voltage_actual = voltage
            
            logger.info(f"Voltaje establecido: {voltage}V")
            return True
            
        except Exception as e:
            logger.error(f"Error estableciendo voltaje: {e}")
            return False
    
    def set_current(self, current: float) -> bool:
        """Establecer corriente de salida (0-5.2A)"""
        if not self._connected:
            logger.warning("Fuente no conectada")
            return False
        
        if not 0 <= current <= 5.2:
            logger.warning(f"Corriente fuera de rango: {current}A")
            return False
        
        try:
            # Simulación - En producción: comando telnet real
            # self._telnet.write(f"CURR {current:.3f}\n".encode())
            # response = self._telnet.read_until(b">", timeout=2)
            
            self._current_setpoint = current
            if self._output_on:
                self._current_actual = current
            
            logger.info(f"Corriente establecida: {current}A")
            return True
            
        except Exception as e:
            logger.error(f"Error estableciendo corriente: {e}")
            return False
    
    def set_output(self, on: bool) -> bool:
        """Encender/apagar salida"""
        if not self._connected:
            logger.warning("Fuente no conectada")
            return False
        
        try:
            # Simulación - En producción: comando telnet real
            # cmd = "OUTP ON\n" if on else "OUTP OFF\n"
            # self._telnet.write(cmd.encode())
            # response = self._telnet.read_until(b">", timeout=2)
            
            self._output_on = on
            if on:
                self._voltage_actual = self._voltage_setpoint
                self._current_actual = self._current_setpoint
            else:
                self._voltage_actual = 0.0
                self._current_actual = 0.0
            
            logger.info(f"Salida {'encendida' if on else 'apagada'}")
            return True
            
        except Exception as e:
            logger.error(f"Error controlando salida: {e}")
            return False
    
    def get_voltage_setpoint(self) -> float:
        """Obtener voltaje establecido"""
        return self._voltage_setpoint
    
    def get_current_setpoint(self) -> float:
        """Obtener corriente establecida"""
        return self._current_setpoint
    
    def get_voltage_current(self) -> Tuple[float, float]:
        """Obtener voltaje y corriente actual"""
        if not self._connected:
            return 0.0, 0.0
        
        # Simulación de lectura con pequeña variación
        if self._output_on:
            import random
            v_noise = random.uniform(-0.1, 0.1)
            i_noise = random.uniform(-0.01, 0.01)
            return (
                max(0, self._voltage_actual + v_noise),
                max(0, self._current_actual + i_noise)
            )
        
        return 0.0, 0.0
    
    def measure_all(self) -> dict:
        """Obtener todas las mediciones"""
        v, i = self.get_voltage_current()
        return {
            'voltage': v,
            'current': i,
            'power': v * i,
            'output_on': self._output_on,
            'connected': self._connected
        }
