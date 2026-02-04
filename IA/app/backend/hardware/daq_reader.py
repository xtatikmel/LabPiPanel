"""
Lectura de DAQ USB5203 (8 canales de termopares)
Simulado para demo - En producción usar driver real
"""

import logging
import random
import time
from typing import List, Optional

logger = logging.getLogger(__name__)


class DAQReader:
    """Lector de DAQ USB5203 para 8 canales de termopares"""
    
    def __init__(self):
        self._connected: bool = False
        self._device = None
        self._channels: int = 8
        self._sample_rate: float = 10.0  # Hz
        self._temperatures: List[float] = [25.0] * 8
        self._channel_names: List[str] = [
            "T_Evap_In",    # Canal 0
            "T_Evap_Mid",   # Canal 1
            "T_Evap_Out",   # Canal 2
            "T_Comp",       # Canal 3
            "T_Cond_In",    # Canal 4
            "T_Cond_Mid",   # Canal 5
            "T_Cond_Out",   # Canal 6
            "T_Ambient"     # Canal 7
        ]
        
    def connect(self) -> bool:
        """Conectar al DAQ USB5203"""
        try:
            # Simulación - En producción: importar driver del DAQ
            # from mcculw import ul
            # from mcculw.enums import InterfaceType
            # ul.create_daq_device(0, "USB-5203")
            # ul.set_config(InterfaceType.USB, 0)
            
            self._connected = True
            logger.info("DAQ USB5203 conectado")
            return True
            
        except Exception as e:
            logger.error(f"Error conectando DAQ: {e}")
            self._connected = False
            return False
    
    def disconnect(self) -> None:
        """Desconectar DAQ"""
        if self._device:
            try:
                # ul.release_daq_device(0)
                pass
            except:
                pass
        self._connected = False
        logger.info("DAQ USB5203 desconectado")
    
    def is_connected(self) -> bool:
        """Verificar conexión"""
        return self._connected
    
    def read_channel(self, channel: int) -> float:
        """Leer temperatura de un canal específico (0-7)"""
        if not self._connected:
            return 0.0
        
        if not 0 <= channel < self._channels:
            logger.warning(f"Canal fuera de rango: {channel}")
            return 0.0
        
        try:
            # Simulación - En producción: lectura real del DAQ
            # from mcculw import ul
            # temp = ul.t_in(0, channel, Scale.CELSIUS)
            
            # Simulación con variación realista
            base_temp = self._temperatures[channel]
            noise = random.uniform(-0.2, 0.2)
            
            # Simular gradientes térmicos típicos
            if channel in [0, 1, 2]:  # Evaporador (frío)
                base_temp = -10.0 + channel * 2.0
            elif channel in [4, 5, 6]:  # Condensador (caliente)
                base_temp = 45.0 - (channel - 4) * 3.0
            elif channel == 3:  # Compresor
                base_temp = 65.0
            else:  # Ambiente
                base_temp = 25.0
            
            temp = base_temp + noise
            self._temperatures[channel] = temp
            return temp
            
        except Exception as e:
            logger.error(f"Error leyendo canal {channel}: {e}")
            return 0.0
    
    def read_all_channels(self) -> List[float]:
        """Leer todos los canales (0-7)"""
        if not self._connected:
            # Retornar datos simulados para demo
            return self._simulate_data()
        
        temps = []
        for ch in range(self._channels):
            temps.append(self.read_channel(ch))
        return temps
    
    def _simulate_data(self) -> List[float]:
        """Generar datos simulados realistas"""
        import math
        t = time.time()
        
        # Simular ciclo de refrigeración con variaciones periódicas
        cycle = math.sin(t * 0.1) * 2.0  # Variación lenta
        
        temps = [
            -8.0 + cycle + random.uniform(-0.5, 0.5),   # T_Evap_In
            -6.0 + cycle + random.uniform(-0.5, 0.5),   # T_Evap_Mid
            -4.0 + cycle + random.uniform(-0.5, 0.5),   # T_Evap_Out
            60.0 + random.uniform(-1.0, 1.0),            # T_Comp
            48.0 + cycle * 0.5 + random.uniform(-0.5, 0.5),  # T_Cond_In
            42.0 + cycle * 0.5 + random.uniform(-0.5, 0.5),  # T_Cond_Mid
            38.0 + cycle * 0.5 + random.uniform(-0.5, 0.5),  # T_Cond_Out
            25.0 + random.uniform(-0.3, 0.3),            # T_Ambient
        ]
        
        return temps
    
    def calibrate(self) -> bool:
        """Calibrar canales del DAQ"""
        if not self._connected:
            logger.warning("DAQ no conectado para calibración")
            return False
        
        try:
            logger.info("Calibrando DAQ USB5203...")
            # Simulación de calibración
            time.sleep(1.0)
            logger.info("Calibración completada")
            return True
            
        except Exception as e:
            logger.error(f"Error en calibración: {e}")
            return False
    
    def get_channel_name(self, channel: int) -> str:
        """Obtener nombre descriptivo del canal"""
        if 0 <= channel < len(self._channel_names):
            return self._channel_names[channel]
        return f"Canal_{channel}"
    
    def get_all_channel_names(self) -> List[str]:
        """Obtener todos los nombres de canales"""
        return self._channel_names.copy()
