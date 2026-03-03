"""
Módulo de control para fuente BK Precision XLN30052
Comunicación vía Telnet (puerto 5024) con comandos SCPI
Instituto Tecnológico Metropolitano (ITM) - Medellín, Colombia
"""

import logging
import time
from typing import Tuple, Optional

try:
    import telnetlib
except ModuleNotFoundError:
    import telnetlib3.telnetlib as telnetlib

logger = logging.getLogger(__name__)


class FuenteXLN:
    """Controlador para fuente de alimentación BK Precision XLN30052"""
    
    def __init__(self, host: str, port: int = 5024, timeout: int = 10):
        """
        Inicializa conexión con la fuente XLN30052
        
        Args:
            host: Dirección IP de la fuente
            port: Puerto Telnet (5024 por defecto)
            timeout: Timeout en segundos
        """
        self.host = host
        self.port = port
        self.timeout = timeout
        self.connection: Optional[telnetlib.Telnet] = None
        self.voltage_max = 300.0
        self.current_max = 5.2
        
        logger.info(f"Inicializando FuenteXLN en {host}:{port}")
    
    def connect(self) -> bool:
        """
        Establece conexión Telnet con la fuente
        
        Returns:
            True si conexión exitosa, False en caso contrario
        """
        try:
            self.connection = telnetlib.Telnet(
                self.host,
                self.port,
                self.timeout
            )
            logger.info(f"Conexión establecida con fuente en {self.host}:{self.port}")
            time.sleep(0.5)
            return True
        except Exception as e:
            logger.error(f"Error al conectar con fuente: {e}")
            return False
    
    def disconnect(self):
        """Cierra la conexión con la fuente"""
        if self.connection:
            try:
                self.connection.close()
                logger.info("Conexión con fuente cerrada")
            except Exception as e:
                logger.error(f"Error al cerrar conexión: {e}")
            finally:
                self.connection = None
    
    def _send_command(self, command: str) -> Optional[str]:
        """
        Envía comando SCPI a la fuente
        
        Args:
            command: Comando SCPI a enviar
            
        Returns:
            Respuesta de la fuente o None si error
        """
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            cmd = command.strip() + "\r\n"
            self.connection.write(cmd.encode('ascii'))
            
            if "?" in command:
                response = self.connection.read_until(b"\n", timeout=self.timeout)
                result = response.decode('ascii').strip()
                logger.debug(f"Comando: {command} -> Respuesta: {result}")
                return result
            else:
                time.sleep(0.1)
                logger.debug(f"Comando enviado: {command}")
                return "OK"
        except Exception as e:
            logger.error(f"Error al enviar comando '{command}': {e}")
            self.disconnect()
            return None
    
    def _validate_voltage(self, voltage: float) -> bool:
        """Valida que el voltaje esté en rango permitido"""
        if not (0 <= voltage <= self.voltage_max):
            logger.error(f"Voltaje {voltage}V fuera de rango [0-{self.voltage_max}V]")
            return False
        return True
    
    def _validate_current(self, current: float) -> bool:
        """Valida que la corriente esté en rango permitido"""
        if not (0 <= current <= self.current_max):
            logger.error(f"Corriente {current}A fuera de rango [0-{self.current_max}A]")
            return False
        return True
    
    def set_voltage(self, voltage: float) -> bool:
        """
        Configura el voltaje de salida
        
        Args:
            voltage: Voltaje en voltios (0-300V)
            
        Returns:
            True si configuración exitosa
        """
        if not self._validate_voltage(voltage):
            return False
        
        if voltage > 50.0:
            logger.warning(f"Configurando voltaje alto: {voltage}V - Verificar seguridad")
        
        result = self._send_command(f"VOLT {voltage:.2f}")
        if result:
            readback = self.get_voltage()
            if readback is not None and abs(readback - voltage) < 0.5:
                logger.info(f"Voltaje configurado: {voltage:.2f}V (verificado: {readback:.2f}V)")
                return True
            else:
                logger.error(f"Verificación de voltaje falló: esperado {voltage}V, leído {readback}V")
                return False
        return False
    
    def get_voltage(self) -> Optional[float]:
        """
        Lee el voltaje configurado
        
        Returns:
            Voltaje en voltios o None si error
        """
        result = self._send_command("VOLT?")
        if result:
            try:
                voltage = float(result)
                return voltage
            except ValueError:
                logger.error(f"Respuesta de voltaje inválida: {result}")
        return None
    
    def set_current(self, current: float) -> bool:
        """
        Configura la corriente límite
        
        Args:
            current: Corriente en amperios (0-5.2A)
            
        Returns:
            True si configuración exitosa
        """
        if not self._validate_current(current):
            return False
        
        result = self._send_command(f"CURR {current:.3f}")
        if result:
            readback = self.get_current()
            if readback is not None and abs(readback - current) < 0.01:
                logger.info(f"Corriente configurada: {current:.3f}A (verificado: {readback:.3f}A)")
                return True
            else:
                logger.error(f"Verificación de corriente falló: esperado {current}A, leído {readback}A")
                return False
        return False
    
    def get_current(self) -> Optional[float]:
        """
        Lee la corriente configurada
        
        Returns:
            Corriente en amperios o None si error
        """
        result = self._send_command("CURR?")
        if result:
            try:
                current = float(result)
                return current
            except ValueError:
                logger.error(f"Respuesta de corriente inválida: {result}")
        return None
    
    def measure_voltage(self) -> Optional[float]:
        """
        Mide el voltaje de salida actual
        
        Returns:
            Voltaje medido en voltios o None si error
        """
        result = self._send_command("MEAS:VOLT?")
        if result:
            try:
                voltage = float(result)
                return voltage
            except ValueError:
                logger.error(f"Medición de voltaje inválida: {result}")
        return None
    
    def measure_current(self) -> Optional[float]:
        """
        Mide la corriente de salida actual
        
        Returns:
            Corriente medida en amperios o None si error
        """
        result = self._send_command("MEAS:CURR?")
        if result:
            try:
                current = float(result)
                return current
            except ValueError:
                logger.error(f"Medición de corriente inválida: {result}")
        return None
    
    def output_on(self) -> bool:
        """
        Activa la salida de la fuente
        
        Returns:
            True si activación exitosa
        """
        result = self._send_command("OUTP ON")
        if result:
            logger.info("Salida de fuente activada")
            return True
        return False
    
    def output_off(self) -> bool:
        """
        Desactiva la salida de la fuente
        
        Returns:
            True si desactivación exitosa
        """
        result = self._send_command("OUTP OFF")
        if result:
            logger.info("Salida de fuente desactivada")
            return True
        return False
    
    def get_output_state(self) -> Optional[bool]:
        """
        Consulta el estado de la salida
        
        Returns:
            True si salida activa, False si inactiva, None si error
        """
        result = self._send_command("OUTP?")
        if result:
            if result in ["1", "ON"]:
                return True
            elif result in ["0", "OFF"]:
                return False
        return None
    
    def check_protections(self) -> dict:
        """
        Verifica el estado de las protecciones
        
        Returns:
            Diccionario con estado de protecciones
        """
        protections = {
            "ovp": False,
            "ocp": False,
            "opp": False,
            "status": "ok"
        }
        
        try:
            status = self._send_command("STAT:QUES:COND?")
            if status:
                status_int = int(status)
                
                if status_int & 0x01:
                    protections["ovp"] = True
                    protections["status"] = "ovp_active"
                    logger.warning("Protección OVP activada")
                
                if status_int & 0x02:
                    protections["ocp"] = True
                    protections["status"] = "ocp_active"
                    logger.warning("Protección OCP activada")
                
                if status_int & 0x04:
                    protections["opp"] = True
                    protections["status"] = "opp_active"
                    logger.warning("Protección OPP activada")
        except Exception as e:
            logger.error(f"Error al verificar protecciones: {e}")
            protections["status"] = "error"
        
        return protections
    
    def reset_protections(self) -> bool:
        """
        Resetea las protecciones de la fuente
        
        Returns:
            True si reset exitoso
        """
        result = self._send_command("*CLS")
        if result:
            logger.info("Protecciones reseteadas")
            return True
        return False
    
    def get_identification(self) -> Optional[str]:
        """
        Obtiene identificación del instrumento
        
        Returns:
            String con identificación o None si error
        """
        result = self._send_command("*IDN?")
        if result:
            logger.info(f"Identificación: {result}")
            return result
        return None
