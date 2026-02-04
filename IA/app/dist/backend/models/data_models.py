"""
Modelos de datos para el Laboratorio Térmico ITM
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class LiveData:
    """Datos en tiempo real del sistema"""
    timestamp: str = ""
    elapsed_time: float = 0.0
    voltage: float = 0.0
    current: float = 0.0
    power: float = 0.0
    temperatures: List[float] = field(default_factory=lambda: [0.0] * 8)
    t_evap_avg: float = 0.0
    t_cond_avg: float = 0.0
    r_thermal: float = 0.0
    relays: List[bool] = field(default_factory=lambda: [False] * 4)
    recording: bool = False
    fuente_connected: bool = False
    daq_connected: bool = False


@dataclass
class SystemStatus:
    """Estado general del sistema"""
    fuente_connected: bool = False
    daq_connected: bool = False
    recording: bool = False
    output_on: bool = False
    elapsed_time: float = 0.0
    error_message: str = ""


@dataclass
class RecordingConfig:
    """Configuración de grabación"""
    filename: str = ""
    auto_start: bool = False
    max_duration: float = 3600.0  # segundos
    sample_rate: float = 10.0  # Hz


@dataclass
class FuenteConfig:
    """Configuración de Fuente XLN"""
    host: str = "192.168.1.100"
    port: int = 10001
    max_voltage: float = 300.0
    max_current: float = 5.2
    max_power: float = 1500.0


@dataclass
class DAQConfig:
    """Configuración de DAQ USB5203"""
    device_id: str = "USB5203"
    sample_rate: float = 10.0  # Hz
    num_channels: int = 8
    channel_names: List[str] = field(default_factory=lambda: [
        "T_Evap_In", "T_Evap_Mid", "T_Evap_Out", "T_Comp",
        "T_Cond_In", "T_Cond_Mid", "T_Cond_Out", "T_Ambient"
    ])
    thermocouple_type: str = "T"  # Tipo T (Cobre-Constantán)
    units: str = "C"  # Celsius


@dataclass
class AlertThreshold:
    """Umbral de alerta individual"""
    enabled: bool = True
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    description: str = ""


@dataclass
class AlertConfig:
    """Configuración de alertas del sistema"""
    enabled: bool = True
    sound_enabled: bool = True
    
    # Alertas de fuente
    voltage_alert: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=0, max_value=300, description="Voltaje fuera de rango"
    ))
    current_alert: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=0, max_value=5.2, description="Corriente fuera de rango"
    ))
    power_alert: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=0, max_value=1500, description="Potencia excede límite"
    ))
    
    # Alertas de temperatura
    temp_evap_min: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=-30, max_value=50, description="Temp. evaporador fuera de rango"
    ))
    temp_cond_max: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=0, max_value=80, description="Temp. condensador alta"
    ))
    temp_comp_max: AlertThreshold = field(default_factory=lambda: AlertThreshold(
        enabled=True, min_value=0, max_value=90, description="Temp. compresor crítica"
    ))


@dataclass
class SystemConfig:
    """Configuración completa del sistema"""
    fuente: FuenteConfig = field(default_factory=FuenteConfig)
    daq: DAQConfig = field(default_factory=DAQConfig)
    alerts: AlertConfig = field(default_factory=AlertConfig)


@dataclass
class Alert:
    """Alerta activa"""
    id: str = ""
    type: str = ""  # 'warning', 'danger', 'info'
    message: str = ""
    parameter: str = ""
    value: float = 0.0
    threshold: float = 0.0
    timestamp: str = ""
    acknowledged: bool = False
