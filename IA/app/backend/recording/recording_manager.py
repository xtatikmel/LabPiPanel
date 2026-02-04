"""
Gestión de grabación de datos a CSV
Laboratorio Térmico ITM
"""

import csv
import io
import logging
import os
import time
from datetime import datetime
from typing import Optional, List, Dict
from pathlib import Path

logger = logging.getLogger(__name__)


class RecordingManager:
    """Gestor de grabación de datos experimentales"""
    
    def __init__(self):
        self.is_recording: bool = False
        self.is_paused: bool = False
        self.filename: Optional[str] = None
        self.filepath: Optional[str] = None
        self.start_time: Optional[float] = None
        self.pause_time: Optional[float] = None
        self.total_paused: float = 0.0
        self.samples_recorded: int = 0
        self._file_handle = None
        self._csv_writer = None
        
        # Directorio de grabaciones
        self.recordings_dir = Path(__file__).parent.parent / "recordings"
        self.recordings_dir.mkdir(exist_ok=True)
        
    def start(self, filename: Optional[str] = None) -> bool:
        """Iniciar grabación"""
        if self.is_recording:
            logger.warning("Ya hay una grabación en curso")
            return False
        
        try:
            # Generar nombre de archivo
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"ITM_LabTermico_{timestamp}.csv"
            
            if not filename.endswith('.csv'):
                filename += '.csv'
            
            self.filename = filename
            self.filepath = str(self.recordings_dir / filename)
            
            # Abrir archivo CSV
            self._file_handle = open(self.filepath, 'w', newline='')
            self._csv_writer = csv.writer(self._file_handle)
            
            # Escribir encabezados
            headers = self._get_csv_headers()
            self._csv_writer.writerow(headers)
            
            # Inicializar tiempos
            self.start_time = time.time()
            self.total_paused = 0.0
            self.samples_recorded = 0
            self.is_recording = True
            self.is_paused = False
            
            logger.info(f"Grabación iniciada: {self.filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error iniciando grabación: {e}")
            self._cleanup()
            return False
    
    def stop(self) -> bool:
        """Detener grabación"""
        if not self.is_recording:
            logger.warning("No hay grabación en curso")
            return False
        
        try:
            self._cleanup()
            
            duration = self.get_elapsed_time()
            logger.info(f"Grabación detenida. Duración: {duration:.1f}s, Muestras: {self.samples_recorded}")
            return True
            
        except Exception as e:
            logger.error(f"Error deteniendo grabación: {e}")
            return False
    
    def pause(self) -> bool:
        """Pausar/reanudar grabación"""
        if not self.is_recording:
            logger.warning("No hay grabación en curso")
            return False
        
        try:
            if self.is_paused:
                # Reanudar
                if self.pause_time:
                    self.total_paused += time.time() - self.pause_time
                self.is_paused = False
                logger.info("Grabación reanudada")
            else:
                # Pausar
                self.pause_time = time.time()
                self.is_paused = True
                logger.info("Grabación pausada")
            
            return True
            
        except Exception as e:
            logger.error(f"Error pausando/reanudando: {e}")
            return False
    
    def write_data(self, data) -> bool:
        """Escribir datos al CSV"""
        if not self.is_recording or self.is_paused:
            return False
        
        try:
            row = self._data_to_row(data)
            self._csv_writer.writerow(row)
            self._file_handle.flush()  # Forzar escritura a disco
            self.samples_recorded += 1
            return True
            
        except Exception as e:
            logger.error(f"Error escribiendo datos: {e}")
            return False
    
    def get_elapsed_time(self) -> float:
        """Obtener tiempo transcurrido de grabación (segundos)"""
        if not self.is_recording and self.start_time is None:
            return 0.0
        
        if self.is_paused and self.pause_time:
            return self.pause_time - self.start_time - self.total_paused
        
        return time.time() - self.start_time - self.total_paused
    
    def get_csv_data(self, filename: Optional[str] = None) -> Optional[str]:
        """Obtener contenido de archivo CSV como string"""
        try:
            if filename is None:
                filepath = self.filepath
            else:
                filepath = str(self.recordings_dir / filename)
            
            if not filepath or not os.path.exists(filepath):
                return None
            
            with open(filepath, 'r') as f:
                return f.read()
                
        except Exception as e:
            logger.error(f"Error leyendo CSV: {e}")
            return None
    
    def list_recordings(self) -> List[Dict]:
        """Listar archivos de grabación disponibles"""
        try:
            files = []
            for f in self.recordings_dir.glob("*.csv"):
                stat = f.stat()
                files.append({
                    'filename': f.name,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
            
            # Ordenar por fecha de modificación (más reciente primero)
            files.sort(key=lambda x: x['modified'], reverse=True)
            return files
            
        except Exception as e:
            logger.error(f"Error listando grabaciones: {e}")
            return []
    
    def _get_csv_headers(self) -> List[str]:
        """Generar encabezados CSV"""
        return [
            'timestamp',
            'elapsed_time',
            'voltage_V',
            'current_A',
            'power_W',
            'T_ch0_EvapIn_C',
            'T_ch1_EvapMid_C',
            'T_ch2_EvapOut_C',
            'T_ch3_Comp_C',
            'T_ch4_CondIn_C',
            'T_ch5_CondMid_C',
            'T_ch6_CondOut_C',
            'T_ch7_Ambient_C',
            'T_evap_avg_C',
            'T_cond_avg_C',
            'R_thermal_KW',
            'relay_1',
            'relay_2',
            'relay_3',
            'relay_4'
        ]
    
    def _data_to_row(self, data) -> List:
        """Convertir objeto LiveData a fila CSV"""
        return [
            data.timestamp,
            f"{data.elapsed_time:.3f}",
            f"{data.voltage:.3f}",
            f"{data.current:.3f}",
            f"{data.power:.3f}",
            f"{data.temperatures[0]:.2f}",
            f"{data.temperatures[1]:.2f}",
            f"{data.temperatures[2]:.2f}",
            f"{data.temperatures[3]:.2f}",
            f"{data.temperatures[4]:.2f}",
            f"{data.temperatures[5]:.2f}",
            f"{data.temperatures[6]:.2f}",
            f"{data.temperatures[7]:.2f}",
            f"{data.t_evap_avg:.2f}",
            f"{data.t_cond_avg:.2f}",
            f"{data.r_thermal:.4f}",
            int(data.relays[0]),
            int(data.relays[1]),
            int(data.relays[2]),
            int(data.relays[3])
        ]
    
    def _cleanup(self) -> None:
        """Limpiar recursos"""
        if self._file_handle:
            try:
                self._file_handle.close()
            except:
                pass
        
        self._file_handle = None
        self._csv_writer = None
        self.is_recording = False
        self.is_paused = False
        self.start_time = None
        self.pause_time = None
