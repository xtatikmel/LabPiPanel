# Dockerfile - LabPiPanel
# Multi-stage build para Python backend + Node.js frontend
# Soporta ARM64 (Raspberry Pi 4) y x86_64

# ============================================================
# STAGE 1: Build Python Backend
# ============================================================
FROM python:3.11-slim-bullseye as backend-builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libusb-1.0-0-dev \
    libusb-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python en una carpeta isolada
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# ============================================================
# STAGE 2: Build Node.js Frontend
# ============================================================
FROM node:18-bullseye as frontend-builder

WORKDIR /app

# Copiar package.json y lock file
COPY package*.json ./

# Instalar dependencias (solo producción)
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Build Next.js
RUN npm run build

# ============================================================
# STAGE 3: Runtime (Python + Node.js)
# ============================================================
FROM python:3.11-slim-bullseye as runtime

WORKDIR /app

# Metadatos
LABEL maintainer="Instituto Tecnológico Metropolitano (ITM)" \
      description="LabPiPanel - Thermal Laboratory Control System" \
      version="0.1.0"

# Instalar dependencias runtime del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    libusb-1.0-0 \
    libusb-0.1-4 \
    curl \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar Python packages instalados
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copiar Node.js runtime modules (opcional, para si necesitamos node en runtime)
COPY --from=frontend-builder /app/node_modules /app/node_modules

# Copiar Next.js build output
COPY --from=frontend-builder /app/.next /app/.next
COPY --from=frontend-builder /app/public /app/public

# Copiar aplicación Python
COPY labpipanel.py /app/
COPY config.py /app/
COPY fuente_xln.py /app/
COPY daq_usb5203.py /app/
COPY relay_controller.py /app/
COPY thermal_experiment.py /app/

# Copiar assets frontend
COPY templates/ /app/templates/
COPY static/ /app/static/

# Crear directorios para logs y resultados
RUN mkdir -p /app/logs /app/results && \
    chmod -R 755 /app/logs /app/results

# Variables de entorno por defecto
ENV FLASK_HOST=0.0.0.0 \
    FLASK_PORT=5000 \
    FLASK_DEBUG=False \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/usr/local/bin:${PATH}"

# Crear usuario no-root (mejorar seguridad)
RUN useradd -m -u 1000 labpipanel && \
    chown -R labpipanel:labpipanel /app
USER labpipanel

# Health check (verifica que API responde)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${FLASK_PORT}/api/status || exit 1

# Exponer puertos
EXPOSE 5000 3000 9090

# Volúmenes
VOLUME ["/app/logs", "/app/results"]

# Entrypoint: ejecutar servidor Flask
CMD ["python", "-u", "labpipanel.py"]

# ============================================================
# NOTAS
# ============================================================
# 
# Build:
#   docker build -t labpipanel:latest .
#
# Build multi-plataforma (ARM64 + x86_64):
#   docker buildx build --platform linux/arm64,linux/amd64 -t labpipanel:latest .
#
# Run:
#   docker run -d \
#     -p 5000:5000 \
#     -p 3000:3000 \
#     -e XLN_HOST=192.168.1.100 \
#     --device /dev/bus/usb \
#     --device /dev/mem \
#     --volume /sys/class/gpio:/sys/class/gpio:rw \
#     --privileged \
#     labpipanel:latest
#
# En Raspberry Pi (con hardware real):
#   docker run -d \
#     --name labpipanel \
#     --restart unless-stopped \
#     -p 5000:5000 \
#     -p 3000:3000 \
#     --device /dev/bus/usb \
#     --device /dev/mem \
#     --device /dev/gpiomem \
#     --volume /sys/class/gpio:/sys/class/gpio:rw \
#     --volume $(pwd)/logs:/app/logs \
#     --volume $(pwd)/results:/app/results \
#     --privileged \
#     -e XLN_HOST=192.168.1.100 \
#     labpipanel:latest
#
