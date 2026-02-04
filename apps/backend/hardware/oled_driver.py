"""
Driver para Display OLED SSD1306 (I2C)
Instituto Tecnológico Metropolitano (ITM) - Medellín
Laboratorio de Investigación Térmica - LabPiPanel 2026

Hardware:
  - Pantalla: SSD1306 128x64 píxeles
  - Protocolo: I2C
  - Dirección: 0x3C (0x3D con jumper)
  - Pines Raspberry Pi: SCL=GPIO3, SDA=GPIO2
"""

import logging
from typing import Dict, Optional, List
import threading
import time
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class OLEDDisplay:
    """
    Controlador para Display OLED SSD1306 con I2C
    
    Proporciona interfaz simple para escribir información del sistema
    en tiempo real.
    """
    
    # Intenta importar librerías reales; si falla, modo simulado
    _hardware_available = False
    
    def __init__(self, address: int = 0x3C, width: int = 128, height: int = 64, simulate: bool = False):
        """
        Inicializa conexión I2C y display OLED
        
        Args:
            address: Dirección I2C del display (0x3C por defecto)
            width: Ancho del display en píxeles (128)
            height: Altura del display en píxeles (64)
            simulate: Fuerza modo simulado sin hardware real
        """
        self.address = address
        self.width = width
        self.height = height
        self.enabled = False
        self.simulate = simulate
        self.i2c = None
        self.display = None
        self.image = None
        self.draw = None
        
        # Buffer para escritura de línea
        self._lock = threading.Lock()
        self._current_content = [""] * 8
        
        self._initialize()
    
    def _initialize(self):
        """Intenta inicializar el display OLED"""
        if self.simulate:
            self._init_simulated()
            return
        
        try:
            # Intenta importar librerías de hardware
            import board
            import busio
            import adafruit_ssd1306
            from PIL import Image, ImageDraw
            
            # Inicializar I2C
            self.i2c = busio.I2C(board.SCL, board.SDA)
            
            # Inicializar display
            self.display = adafruit_ssd1306.Adafruit_SSD1306_I2C(
                self.width, self.height, self.i2c, addr=self.address
            )
            
            # Crear imagen para dibujar
            self.image = Image.new('1', (self.width, self.height))
            self.draw = ImageDraw.Draw(self.image)
            
            self.enabled = True
            self._hardware_available = True
            logger.info(f"OLED inicializado correctamente en dirección 0x{self.address:02x}")
            
            # Mostrar pantalla de inicio
            self._show_bootscreen()
            
        except Exception as e:
            logger.warning(f"Hardware OLED no disponible ({e}), usando modo simulado")
            self._init_simulated()
    
    def _init_simulated(self):
        """Inicializa modo simulado (sin hardware real)"""
        self.enabled = True
        self.simulate = True
        logger.info("OLED en modo simulado (sin hardware I2C)")
    
    def _show_bootscreen(self):
        """Muestra pantalla de inicio"""
        if not self.enabled or self.simulate:
            return
        
        try:
            self.draw.rectangle((0, 0, self.width, self.height), fill=0)
            self.draw.text((0, 0), "LABPIPANEL", fill=1)
            self.draw.text((0, 10), "Iniciando...", fill=1)
            self.display.image(self.image)
            self.display.display()
        except Exception as e:
            logger.error(f"Error en pantalla de inicio: {e}")
    
    def write_text(self, text: str, x: int = 0, y: int = 0, font=None):
        """
        Escribe texto en posición específica
        
        Args:
            text: Texto a escribir
            x: Posición X en píxeles
            y: Posición Y en píxeles
            font: Fuente (usa predeterminada si None)
        """
        if not self.enabled:
            return
        
        try:
            with self._lock:
                if self.simulate:
                    logger.debug(f"OLED (simulado): [{x},{y}] {text}")
                    return
                
                self.draw.text((x, y), text, fill=1, font=font)
                self.display.image(self.image)
                self.display.display()
        except Exception as e:
            logger.error(f"Error escribiendo texto: {e}")
    
    def write_status(self, title: str, values: Dict[str, str], refresh: bool = True):
        """
        Escribe estado del sistema en OLED
        
        Formato:
        ┌────────────────────┐
        │ LABPIPANEL         │  <- title
        ├────────────────────┤
        │ T_Evap: 45.2°C    │  <- values[0]
        │ T_Cond: 35.1°C    │  <- values[1]
        │ V: 250.0V I: 2.5A │  <- values[2]
        │ P: 625W Status: OK │  <- values[3]
        └────────────────────┘
        
        Args:
            title: Título (máx 20 caracteres)
            values: Dict {label: value} (máx 4 líneas)
            refresh: Si True, actualiza display
        """
        if not self.enabled:
            return
        
        try:
            with self._lock:
                if self.simulate:
                    logger.debug(f"OLED Status: {title} | {values}")
                    return
                
                # Limpiar pantalla
                self.draw.rectangle((0, 0, self.width, self.height), fill=0)
                
                # Título (línea 0-9)
                self.draw.text((0, 0), title[:20], fill=1)
                
                # Valores (líneas 10-63, ~4 líneas de 10px cada una)
                line_height = 12
                y_start = 10
                
                for idx, (label, value) in enumerate(list(values.items())[:4]):
                    y = y_start + (idx * line_height)
                    text = f"{label}: {value}"[:20]  # Truncar a 20 chars
                    self.draw.text((0, y), text, fill=1)
                
                if refresh:
                    self.display.image(self.image)
                    self.display.display()
        
        except Exception as e:
            logger.error(f"Error escribiendo estado: {e}")
    
    def write_alert(self, message: str, icon: str = "⚠️"):
        """
        Muestra alerta en OLED (pantalla completa)
        
        Args:
            message: Mensaje de alerta
            icon: Icono o símbolo (⚠️, ❌, ✓, etc.)
        """
        if not self.enabled:
            return
        
        try:
            with self._lock:
                if self.simulate:
                    logger.warning(f"OLED Alert: {icon} {message}")
                    return
                
                # Limpiar
                self.draw.rectangle((0, 0, self.width, self.height), fill=0)
                
                # Dibuja recuadro
                self.draw.rectangle((1, 1, self.width-2, self.height-2), outline=1)
                
                # Icono y mensaje
                self.draw.text((5, 15), f"{icon} ALERTA", fill=1)
                
                # Mensaje en múltiples líneas
                lines = [message[i:i+18] for i in range(0, len(message), 18)]
                for idx, line in enumerate(lines[:3]):
                    self.draw.text((5, 30 + idx * 12), line, fill=1)
                
                self.display.image(self.image)
                self.display.display()
        
        except Exception as e:
            logger.error(f"Error escribiendo alerta: {e}")
    
    def write_progress(self, title: str, percent: float, detail: str = ""):
        """
        Muestra barra de progreso
        
        Args:
            title: Título del proceso
            percent: Porcentaje (0-100)
            detail: Línea de detalle
        """
        if not self.enabled:
            return
        
        try:
            with self._lock:
                if self.simulate:
                    logger.info(f"OLED Progress: {title} {percent:.0f}% | {detail}")
                    return
                
                self.draw.rectangle((0, 0, self.width, self.height), fill=0)
                
                # Título
                self.draw.text((0, 0), title[:20], fill=1)
                
                # Barra de progreso (líneas 10-20)
                bar_y = 15
                bar_width = int((self.width - 4) * (percent / 100))
                self.draw.rectangle((2, bar_y, self.width-2, bar_y+8), outline=1)
                if bar_width > 0:
                    self.draw.rectangle((2, bar_y, 2+bar_width, bar_y+8), fill=1)
                
                # Porcentaje
                pct_text = f"{percent:.0f}%"
                self.draw.text((self.width-30, bar_y), pct_text, fill=1)
                
                # Detalle
                if detail:
                    self.draw.text((0, 30), detail[:20], fill=1)
                
                self.display.image(self.image)
                self.display.display()
        
        except Exception as e:
            logger.error(f"Error escribiendo progreso: {e}")
    
    def clear(self):
        """Limpia pantalla OLED"""
        if not self.enabled:
            return
        
        try:
            with self._lock:
                if self.simulate:
                    logger.debug("OLED cleared")
                    return
                
                self.draw.rectangle((0, 0, self.width, self.height), fill=0)
                self.display.image(self.image)
                self.display.display()
        
        except Exception as e:
            logger.error(f"Error limpiando OLED: {e}")
    
    def shutdown(self):
        """Apaga el display de forma segura"""
        try:
            with self._lock:
                if self.simulate:
                    logger.info("OLED shutdown (simulado)")
                    return
                
                if self.display:
                    self.draw.rectangle((0, 0, self.width, self.height), fill=0)
                    self.display.image(self.image)
                    self.display.display()
                    logger.info("OLED apagado")
        
        except Exception as e:
            logger.error(f"Error apagando OLED: {e}")


class OLEDMonitor(threading.Thread):
    """
    Monitor en background que actualiza OLED cada N segundos
    con datos del sistema en tiempo real
    """
    
    def __init__(self, oled: OLEDDisplay, update_interval: float = 2.0):
        """
        Inicializa monitor de OLED
        
        Args:
            oled: Instancia de OLEDDisplay
            update_interval: Intervalo de actualización en segundos
        """
        super().__init__(daemon=True)
        self.oled = oled
        self.update_interval = update_interval
        self.running = False
        self._current_data = {}
        self._lock = threading.Lock()
    
    def update_data(self, data: Dict[str, str]):
        """Actualiza datos a mostrar en OLED"""
        with self._lock:
            self._current_data = data.copy()
    
    def run(self):
        """Loop de actualización"""
        self.running = True
        logger.info("OLEDMonitor iniciado")
        
        while self.running:
            try:
                with self._lock:
                    data = self._current_data.copy()
                
                if data:
                    title = data.pop('title', 'LABPIPANEL')
                    self.oled.write_status(title, data)
                
                time.sleep(self.update_interval)
            
            except Exception as e:
                logger.error(f"Error en OLEDMonitor: {e}")
                time.sleep(self.update_interval)
    
    def stop(self):
        """Detiene el monitor"""
        self.running = False
        logger.info("OLEDMonitor detenido")


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Crear instancia (en modo simulado si no hay hardware)
    oled = OLEDDisplay(simulate=True)
    
    # Escribir estado
    oled.write_status(
        "LABPIPANEL",
        {
            "T_Evap": "45.2°C",
            "T_Cond": "35.1°C",
            "V": "250.0V",
            "P": "625W"
        }
    )
    
    time.sleep(2)
    
    # Mostrar alerta
    oled.write_alert("TEMPERATURA ALTA", icon="⚠️")
    
    time.sleep(2)
    
    # Mostrar progreso
    oled.write_progress("Experimento", 45.0, "Nivel 2/4")
    
    time.sleep(2)
    
    # Limpiar
    oled.clear()
    
    logger.info("Demo completado")
