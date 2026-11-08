"""Fixtures compartidos para los tests del backend."""

import copy
import sys
from pathlib import Path

import pytest

# Permite importar `app` cuando pytest se ejecuta desde apps/backend
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import app as app_module  # noqa: E402


@pytest.fixture(autouse=True)
def restore_global_state():
    """Aísla cada test del estado global del módulo app."""
    original_system_config = copy.deepcopy(app_module.system_config)
    original_alert_config = copy.deepcopy(app_module.alert_manager.get_config())

    if app_module.recorder.is_recording:
        app_module.recorder.stop()
    app_module.alert_manager.clear_all_alerts()

    yield

    if app_module.recorder.is_recording:
        app_module.recorder.stop()

    app_module.system_config = original_system_config
    app_module.alert_manager.set_config(original_alert_config)
    app_module.alert_manager.clear_all_alerts()


@pytest.fixture()
def client():
    """Cliente de pruebas de Flask sin arrancar el loop de adquisición."""
    app_module.app.config.update(TESTING=True)
    with app_module.app.test_client() as test_client:
        yield test_client
