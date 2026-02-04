"""
Sistema de Alertas para Laboratorio Térmico ITM
Gestión de límites y notificaciones
"""

import logging
import time
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Callable
from dataclasses import asdict

from models.data_models import Alert, AlertConfig, LiveData

logger = logging.getLogger(__name__)


class AlertManager:
    """Gestor de alertas del sistema"""
    
    def __init__(self):
        self.config: AlertConfig = AlertConfig()
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.max_history = 100
        self.callbacks: List[Callable] = []
        
    def set_config(self, config: AlertConfig) -> None:
        """Actualizar configuración de alertas"""
        self.config = config
        logger.info("Configuración de alertas actualizada")
    
    def get_config(self) -> AlertConfig:
        """Obtener configuración actual"""
        return self.config
    
    def register_callback(self, callback: Callable) -> None:
        """Registrar callback para nuevas alertas"""
        self.callbacks.append(callback)
    
    def _notify_callbacks(self, alert: Alert) -> None:
        """Notificar a todos los callbacks registrados"""
        for callback in self.callbacks:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"Error en callback de alerta: {e}")
    
    def _create_alert(self, alert_type: str, message: str, parameter: str, 
                      value: float, threshold: float) -> Alert:
        """Crear nueva alerta"""
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            type=alert_type,
            message=message,
            parameter=parameter,
            value=value,
            threshold=threshold,
            timestamp=datetime.now().isoformat(),
            acknowledged=False
        )
        return alert
    
    def check_data(self, data: LiveData) -> List[Alert]:
        """Verificar datos contra umbrales y generar alertas"""
        if not self.config.enabled:
            return []
        
        new_alerts = []
        
        # Verificar voltaje
        if self.config.voltage_alert.enabled:
            if data.voltage > self.config.voltage_alert.max_value:
                alert = self._create_alert(
                    'danger',
                    f"Voltaje excede límite máximo: {data.voltage:.1f}V > {self.config.voltage_alert.max_value}V",
                    'voltage',
                    data.voltage,
                    self.config.voltage_alert.max_value
                )
                new_alerts.append(alert)
        
        # Verificar corriente
        if self.config.current_alert.enabled:
            if data.current > self.config.current_alert.max_value:
                alert = self._create_alert(
                    'danger',
                    f"Corriente excede límite máximo: {data.current:.2f}A > {self.config.current_alert.max_value}A",
                    'current',
                    data.current,
                    self.config.current_alert.max_value
                )
                new_alerts.append(alert)
        
        # Verificar potencia
        if self.config.power_alert.enabled:
            if data.power > self.config.power_alert.max_value:
                alert = self._create_alert(
                    'danger',
                    f"Potencia excede límite máximo: {data.power:.1f}W > {self.config.power_alert.max_value}W",
                    'power',
                    data.power,
                    self.config.power_alert.max_value
                )
                new_alerts.append(alert)
        
        # Verificar temperatura evaporador (promedio)
        if self.config.temp_evap_min.enabled:
            if data.t_evap_avg < self.config.temp_evap_min.min_value:
                alert = self._create_alert(
                    'warning',
                    f"Temp. evaporador baja: {data.t_evap_avg:.1f}°C < {self.config.temp_evap_min.min_value}°C",
                    't_evap_avg',
                    data.t_evap_avg,
                    self.config.temp_evap_min.min_value
                )
                new_alerts.append(alert)
            elif data.t_evap_avg > self.config.temp_evap_min.max_value:
                alert = self._create_alert(
                    'warning',
                    f"Temp. evaporador alta: {data.t_evap_avg:.1f}°C > {self.config.temp_evap_min.max_value}°C",
                    't_evap_avg',
                    data.t_evap_avg,
                    self.config.temp_evap_min.max_value
                )
                new_alerts.append(alert)
        
        # Verificar temperatura condensador
        if self.config.temp_cond_max.enabled:
            if data.t_cond_avg > self.config.temp_cond_max.max_value:
                alert = self._create_alert(
                    'danger',
                    f"Temp. condensador crítica: {data.t_cond_avg:.1f}°C > {self.config.temp_cond_max.max_value}°C",
                    't_cond_avg',
                    data.t_cond_avg,
                    self.config.temp_cond_max.max_value
                )
                new_alerts.append(alert)
        
        # Verificar temperatura compresor (canal 3)
        if self.config.temp_comp_max.enabled and len(data.temperatures) > 3:
            t_comp = data.temperatures[3]
            if t_comp > self.config.temp_comp_max.max_value:
                alert = self._create_alert(
                    'danger',
                    f"Temp. compresor crítica: {t_comp:.1f}°C > {self.config.temp_comp_max.max_value}°C",
                    't_comp',
                    t_comp,
                    self.config.temp_comp_max.max_value
                )
                new_alerts.append(alert)
        
        # Agregar alertas activas
        for alert in new_alerts:
            self.active_alerts[alert.id] = alert
            self.alert_history.insert(0, alert)
            self._notify_callbacks(alert)
            logger.warning(f"Alerta generada: {alert.message}")
        
        # Limitar historial
        if len(self.alert_history) > self.max_history:
            self.alert_history = self.alert_history[:self.max_history]
        
        return new_alerts
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """Reconocer (ack) una alerta"""
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].acknowledged = True
            # Mover a historial
            del self.active_alerts[alert_id]
            logger.info(f"Alerta {alert_id} reconocida")
            return True
        return False
    
    def clear_all_alerts(self) -> None:
        """Limpiar todas las alertas activas"""
        self.active_alerts.clear()
        logger.info("Todas las alertas limpiadas")
    
    def get_active_alerts(self) -> List[Alert]:
        """Obtener alertas activas no reconocidas"""
        return [a for a in self.active_alerts.values() if not a.acknowledged]
    
    def get_alert_history(self, limit: int = 50) -> List[Alert]:
        """Obtener historial de alertas"""
        return self.alert_history[:limit]
    
    def clear_alert_by_parameter(self, parameter: str) -> None:
        """Limpiar alertas de un parámetro específico"""
        to_remove = [aid for aid, a in self.active_alerts.items() if a.parameter == parameter]
        for aid in to_remove:
            del self.active_alerts[aid]
