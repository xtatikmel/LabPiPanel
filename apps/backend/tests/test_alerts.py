"""Tests unitarios del gestor de alertas."""

from alerts.alert_manager import AlertManager
from models.data_models import LiveData


def test_does_not_duplicate_active_alerts():
    manager = AlertManager()
    data = LiveData(voltage=999.0)

    first = manager.check_data(data)
    second = manager.check_data(data)

    assert len(first) >= 1
    assert second == []
    assert len(manager.get_active_alerts()) == len(first)


def test_ignores_threshold_with_none_value():
    manager = AlertManager()
    manager.config.voltage_alert.max_value = None

    alerts = manager.check_data(LiveData(voltage=999.0))

    assert all(alert.parameter != 'voltage' for alert in alerts)
