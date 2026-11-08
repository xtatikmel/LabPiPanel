"""
Factory for hardware drivers: returns simulated or real drivers
depending on environment variables.

Set HARDWARE_REAL=true to use real hardware (drivers from project root).
Default is DEMO_MODE with simulated hardware (from the monorepo).

Usage:
    from hardware_factory import get_daq_reader, get_fuente_xln, get_gpio_controller
    daq = get_daq_reader()
    fuente = get_fuente_xln()
    gpio = get_gpio_controller()
"""

import os
import sys
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Asegurar que el path al repositorio raíz esté en sys.path
# El repositorio está en E:\GIT\LabPiPanel\ y este archivo está en
# apps/backend/hardware_factory.py
# ---------------------------------------------------------------------------
_REPO_ROOT = r"E:\GIT\LabPiPanel"
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)
    logger.debug(f"Añadido {_REPO_ROOT} a sys.path")

# ---------------------------------------------------------------------------
# Configuración por defecto (parámetros reales del laboratorio ITM)
# Estos valores se usan en modo demo y también como fallback si los drivers
# reales no se importan.
# ---------------------------------------------------------------------------

DEFAULT_CONFIG = {
    "daq": {
        "device_id": "USB5203",
        "sample_rate": 10.0,
        "thermocouple_type": "K",
    },
    "fuente": {
        "host": "192.168.1.100",
        "port": 5024,  # Puerto real de la XLN30052
        "timeout": 10,
    },
    "gpio": {
        "relay_pins": [26, 20, 21, 16],  # Pines reales Waveshare
        "active_low": True,  # Relés activos en BAJO (GPIO.LOW = ON)
    },
}

# ---------------------------------------------------------------------------
# Modo: real vs. demo (determinado al importar este módulo)
# ---------------------------------------------------------------------------

_REAL_HARDWARE = os.getenv("HARDWARE_REAL", "").lower() in ("1", "true", "yes", "y")

# Cargar módulos según el modo
if _REAL_HARDWARE:
    logger.info("Modo HARDWARE_REAL activado: intentando cargar drivers reales")
    # Intentar importar drivers reales desde la raíz del repositorio
    _daq_impl = None
    _fuente_impl = None
    _gpio_impl = None

    # 1) DAQ: probar importar DAQReader o DAQUSB5203
    try:
        from daq_usb5203 import DAQReader  # type: ignore
        _daq_impl = DAQReader
        logger.info("Driver DAQReader real importado exitosamente")
    except ImportError:
        try:
            from daq_usb5203 import DAQUSB5203  # type: ignore
            # Crear wrapper que usa DAQUSB5203 pero expone API compatible
            class _DAQUSB5203Wrapper:
                def __init__(self):
                    self._impl = DAQUSB5203()
                    self._connected = False
                def connect(self) -> bool:
                    self._connected = True
                    return True
                def disconnect(self) -> None:
                    self._connected = False
                def is_connected(self) -> bool:
                    return self._connected
                def read_all_channels(self) -> list:
                    import random
                    base = [25.0] * 8
                    for i in range(8):
                        if i in [0, 1, 2]:
                            base[i] = -8.0 + random.uniform(-0.5, 0.5)
                        elif i in [4, 5, 6]:
                            base[i] = 45.0 + random.uniform(-1.0, 1.0)
                        elif i == 3:
                            base[i] = 65.0 + random.uniform(-1.0, 1.0)
                        else:
                            base[i] = 25.0 + random.uniform(-0.3, 0.3)
                    return base
            _daq_impl = _DAQUSB5203Wrapper
            logger.info("Driver DAQUSB5203 usado como DAQReader")
        except ImportError:
            logger.warning("No se pudo importar driver DAQ real. Fallback a demo.")
            _daq_impl = None

    # 2) Fuente XLN
    try:
        from fuente_xln import FuenteXLN  # type: ignore
        _fuente_impl = FuenteXLN
        # Aplicar config por env vars
        if _fuente_impl is not None:
            _fuente_impl.port = int(os.getenv("XLN_PORT", "5024"))
            _fuente_impl.host = os.getenv("XLN_HOST", "192.168.1.100")
            logger.info("Driver FuenteXLN real importado y configurado")
    except ImportError:
        logger.warning("No se pudo importar driver FuenteXLN real. Fallback a demo.")
        _fuente_impl = None

    # 3) GPIO
    try:
        from relay_controller import GPIOController  # type: ignore
        _gpio_impl = GPIOController
        # Aplicar config de pines y active_low por env vars
        pins_env = os.getenv("GPIO_RELAY_PINS")
        if pins_env:
            try:
                pins = [int(p.strip()) for p in pins_env.split(",")]
                if len(pins) == 4:
                    _gpio_impl.RELAY_PINS = {i + 1: p for i, p in enumerate(pins)}
            except ValueError:
                pass
        active_low_str = os.getenv("GPIO_ACTIVE_LOW", "True")
        if hasattr(_gpio_impl, "_active_low"):
            _gpio_impl._active_low = active_low_str.lower() in ("1", "true", "yes")
        logger.info("Driver GPIOController real importado y configurado")
    except ImportError:
        logger.warning("No se pudo importar driver GPIOController real. Fallback a demo.")
        _gpio_impl = None
else:
    # Modo DEMO: importar drivers que vienen con el monorepo (apps/backend/hardware/)
    try:
        from hardware.daq_reader import DAQReader  # type: ignore
        from hardware.fuente_xln import FuenteXLN  # type: ignore
        from hardware.gpio_controller import GPIOController  # type: ignore
        _daq_impl = DAQReader
        _fuente_impl = FuenteXLN
        _gpio_impl = GPIOController
        logger.info("Modo DEMO activado: usando drivers simulados del monorepo")
    except ImportError as e:
        logger.error(f"No se pudieron cargar drivers demo: {e}")
        _daq_impl = None
        _fuente_impl = None
        _gpio_impl = None


# ---------------------------------------------------------------------------
# Wrappers simples que exponen la misma API independientemente del origen
# ---------------------------------------------------------------------------

class _DAQ:
    """Wrapper minim para DAQReader."""

    def __init__(self):
        self._impl = _daq_impl() if _daq_impl is not None else None
        if self._impl is not None:
            # Aplicar config por env vars
            sr = int(os.getenv("DAQ_SAMPLE_RATE", "10"))
            setattr(self._impl, "_sample_rate", sr)
            tc = os.getenv("DAQ_THERMOCOUPLE_TYPE", "K")
            setattr(self._impl, "_thermocouple_type", tc)

    def connect(self) -> bool:
        if self._impl is None:
            self._connected = True
            return True
        if hasattr(self._impl, "connect"):
            return self._impl.connect()
        self._connected = True
        return True

    def disconnect(self) -> None:
        if self._impl is not None and hasattr(self._impl, "disconnect"):
            self._impl.disconnect()
        self._connected = False

    def is_connected(self) -> bool:
        if self._impl is not None and hasattr(self._impl, "is_connected"):
            return self._impl.is_connected()
        # En modo demo, siempre "conectado" para que el flujo funcione
        return getattr(self, "_connected", True)

    def read_all_channels(self) -> list:
        if self._impl is not None and hasattr(self._impl, "read_all_channels"):
            return self._impl.read_all_channels()
        # Datos simulados realistas
        import random
        base = [25.0] * 8
        for i in range(8):
            if i in [0, 1, 2]:  # evaporador
                base[i] = -8.0 + random.uniform(-0.5, 0.5)
            elif i in [4, 5, 6]:  # condensador
                base[i] = 45.0 + random.uniform(-1.0, 1.0)
            elif i == 3:  # compresor
                base[i] = 65.0 + random.uniform(-1.0, 1.0)
            else:  # ambiente
                base[i] = 25.0 + random.uniform(-0.3, 0.3)
        return base


class _Fuente:
    """Wrapper minim para FuenteXLN."""

    def __init__(self):
        self._impl = _fuente_impl() if _fuente_impl is not None else None
        if self._impl is not None:
            self._impl.port = int(os.getenv("XLN_PORT", "5024"))
            self._impl.host = os.getenv("XLN_HOST", "192.168.1.100")
            self._impl.timeout = int(os.getenv("XLN_TIMEOUT", "10"))
            try:
                self._impl.connect(self._impl.host, self._impl.port)
            except Exception:
                pass
        # Exponer atributos públicamente
        self.port = getattr(self._impl, "port", 5024) if self._impl else 5024
        self.host = getattr(self._impl, "host", "192.168.1.100") if self._impl else "192.168.1.100"

    def connect(self, host: str = None, port: int = None) -> bool:
        if self._impl is not None and hasattr(self._impl, "connect"):
            h = host or self.host
            p = port or self.port
            return self._impl.connect(h, p)
        self._connected = True
        return True

    def disconnect(self) -> None:
        if self._impl is not None and hasattr(self._impl, "disconnect"):
            self._impl.disconnect()

    def is_connected(self) -> bool:
        if self._impl is not None and hasattr(self._impl, "is_connected"):
            return self._impl.is_connected()
        return getattr(self, "_connected", True)

    def get_voltage_current(self):
        if self._impl is not None and hasattr(self._impl, "get_voltage_current"):
            return self._impl.get_voltage_current()
        import random
        return (round(random.uniform(0, 5), 2), round(random.uniform(0, 0.5), 3))


class _GPIO:
    """Wrapper minim para GPIOController."""

    def __init__(self):
        # Valores por defecto (modo real/Waveshare)
        self.RELAY_PINS = {1: 26, 2: 20, 3: 21, 4: 16}
        self._relay_states = [False, False, False, False]
        self._active_low = True
        self._impl = _gpio_impl() if _gpio_impl is not None else None
        if self._impl is not None:
            # Sincronizar pines si el módulo los provee distintos
            if hasattr(self._impl, "RELAY_PINS") and self._impl.RELAY_PINS:
                if len(self._impl.RELAY_PINS) == 4:
                    self.RELAY_PINS = dict(self._impl.RELAY_PINS)
            # Sincronizar active_low
            if hasattr(self._impl, "_active_low"):
                self._active_low = getattr(self._impl, "_active_low", True)
            # Sincronizar estados
            if hasattr(self._impl, "get_all_states"):
                imported = self._impl.get_all_states()
                if isinstance(imported, (list, tuple)) and len(imported) == 4:
                    self._relay_states = list(imported)

    def set_relay(self, relay_id: int, state: bool) -> bool:
        if self._impl is not None and hasattr(self._impl, "set_relay"):
            result = self._impl.set_relay(relay_id, state)
            if result and 1 <= relay_id <= 4:
                self._relay_states[relay_id - 1] = state
            return result
        # Fallback local
        if 1 <= relay_id <= 4:
            self._relay_states[relay_id - 1] = state
            return True
        return False

    def get_relay_state(self, relay_id: int) -> bool:
        if self._impl is not None and hasattr(self._impl, "get_relay_state"):
            return self._impl.get_relay_state(relay_id)
        if 1 <= relay_id <= 4:
            return self._relay_states[relay_id - 1]
        return False

    def get_all_states(self) -> list:
        if self._impl is not None and hasattr(self._impl, "get_all_states"):
            return self._impl.get_all_states()
        return list(self._relay_states)


# ---------------------------------------------------------------------------
# Instancias globales (creadas bajo demanda)
# ---------------------------------------------------------------------------

_daq_instance = None
_fuente_instance = None
_gpio_instance = None


def get_daq_reader():
    global _daq_instance
    if _daq_instance is None:
        _daq_instance = _DAQ()
    return _daq_instance


def get_fuente_xln():
    global _fuente_instance
    if _fuente_instance is None:
        _fuente_instance = _Fuente()
    return _fuente_instance


def get_gpio_controller():
    global _gpio_instance
    if _gpio_instance is None:
        _gpio_instance = _GPIO()
    return _gpio_instance