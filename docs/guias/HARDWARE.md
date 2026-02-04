# Especificaciones de Hardware - LabPiPanel

Documentación técnica del hardware utilizado en el sistema LabPiPanel.

## Índice

1. [Raspberry Pi 4](#raspberry-pi-4)
2. [Fuente BK Precision XLN30052](#fuente-bk-precision-xln30052)
3. [DAQ Measurement Computing USB-5203](#daq-measurement-computing-usb-5203)
4. [Módulo de Relés Waveshare](#módulo-de-relés-waveshare)
5. [Termopares Tipo K](#termopares-tipo-k)
6. [Diagrama de Conexiones](#diagrama-de-conexiones)

---

## Raspberry Pi 4

**Modelo**: Raspberry Pi 4 Model B

### Especificaciones
- **CPU**: Broadcom BCM2711, Quad-core Cortex-A72 (ARM v8) 64-bit @ 1.5GHz
- **RAM**: 2GB, 4GB u 8GB LPDDR4 (recomendado: 4GB mínimo)
- **GPIO**: 40 pines (BCM numeración)
- **USB**: 2x USB 3.0, 2x USB 2.0
- **Ethernet**: Gigabit Ethernet
- **Sistema Operativo**: Raspberry Pi OS (Bullseye/Bookworm)

### Configuración de Red
\`\`\`bash
# Configurar IP estática en NetworkManager
sudo nmcli con mod "Wired connection 1" ipv4.addresses 192.168.1.50/24
sudo nmcli con mod "Wired connection 1" ipv4.gateway 192.168.1.1
sudo nmcli con mod "Wired connection 1" ipv4.dns "8.8.8.8"
sudo nmcli con mod "Wired connection 1" ipv4.method manual
sudo nmcli con up "Wired connection 1"
\`\`\`

### Pines GPIO Utilizados (Numeración BCM)

| Pin GPIO | Función | Descripción |
|----------|---------|-------------|
| GPIO 26 | RELAY_1 | Control de bomba de fluido |
| GPIO 20 | RELAY_2 | Relé de respaldo 1 |
| GPIO 21 | RELAY_3 | Relé de respaldo 2 |
| GPIO 16 | RELAY_4 | Relé de respaldo 3 |

**IMPORTANTE**: Los relés son **activos en BAJO**
- `GPIO.LOW` = Relé ACTIVADO
- `GPIO.HIGH` = Relé DESACTIVADO

---

## Fuente BK Precision XLN30052

**Modelo**: BK Precision XLN30052 Programmable DC Power Supply

### Especificaciones
- **Voltaje**: 0-300V
- **Corriente**: 0-5.2A
- **Potencia Máxima**: 1500W
- **Regulación de Voltaje**: <0.01% + 10mV
- **Regulación de Corriente**: <0.05% + 10mA
- **Interfaz**: Ethernet (Telnet, SCPI)
- **Puerto Telnet**: **5024** (NO 23)

### Protecciones Configuradas
- **OVP (Over Voltage Protection)**: 310V
- **OCP (Over Current Protection)**: 5.5A
- **OPP (Over Power Protection)**: 1600W

### Comandos SCPI Utilizados

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `VOLT <value>` | Configurar voltaje | `VOLT 50.00` |
| `VOLT?` | Leer voltaje configurado | `VOLT?` → `50.00` |
| `CURR <value>` | Configurar corriente | `CURR 2.500` |
| `CURR?` | Leer corriente configurada | `CURR?` → `2.500` |
| `OUTP ON` | Activar salida | `OUTP ON` |
| `OUTP OFF` | Desactivar salida | `OUTP OFF` |
| `OUTP?` | Estado de salida | `OUTP?` → `1` o `0` |
| `MEAS:VOLT?` | Medir voltaje actual | `MEAS:VOLT?` → `50.12` |
| `MEAS:CURR?` | Medir corriente actual | `MEAS:CURR?` → `2.456` |
| `STAT:QUES:COND?` | Estado de protecciones | `STAT:QUES:COND?` → `0` |
| `*CLS` | Limpiar protecciones | `*CLS` |
| `*IDN?` | Identificación | `*IDN?` → `BK,XLN30052,...` |

### Configuración de Red
- **IP Address**: Configurar IP estática en menú de la fuente
- **Puerto**: 5024 (Telnet)
- **Timeout**: 10 segundos
- **Terminación**: `\r\n`

### Procedimiento de Calibración
1. Conectar multímetro de referencia (precisión 0.01%)
2. Configurar voltaje en varios puntos: 5V, 50V, 100V, 200V, 300V
3. Comparar lectura de la fuente con multímetro
4. Ajustar calibración si desviación >0.05%
5. Repetir para corriente: 0.5A, 1A, 2A, 3A, 5A

---

## DAQ Measurement Computing USB-5203

**Modelo**: USB-5203 Thermocouple Measurement DAQ

### Especificaciones
- **Canales**: 8 entradas diferenciales
- **Tipos de Termopar**: J, K, R, S, T, N, E, B
- **Resolución**: 24-bit ADC
- **Sensores CJC**: 2 integrados
- **Precisión**: ±0.5°C (típico)
- **Rango de Temperatura**: -270°C a +2000°C (depende del tipo)
- **Interfaz**: USB 2.0

### Asignación de Canales

| Canal | Ubicación | Descripción |
|-------|-----------|-------------|
| CH0 | Evaporador | Termopar 1 - Zona inferior |
| CH1 | Evaporador | Termopar 2 - Zona media |
| CH2 | Evaporador | Termopar 3 - Zona superior |
| CH3 | Evaporador | Termopar 4 - Salida |
| CH4 | Condensador | Termopar 5 - Entrada |
| CH5 | Condensador | Termopar 6 - Zona superior |
| CH6 |
