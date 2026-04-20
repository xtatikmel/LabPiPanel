#!/bin/bash

################################################################################
# LabPiPanel - Setup & Installation Script
# Instituto Tecnológico Metropolitano (ITM)
# 
# Este script automatiza la instalación y configuración del proyecto
# Uso: bash scripts/install.sh
################################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerequisitos..."
    
    # Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 no está instalado"
        exit 1
    fi
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    log_success "Python $PYTHON_VERSION encontrado"
    
    # Node.js (para frontend)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js no está instalado (necesario para frontend)"
        read -p "¿Continuar solo con backend? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 1
        fi
        SKIP_FRONTEND=true
    else
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js $NODE_VERSION, npm $NPM_VERSION encontrados"
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi
    log_success "Git encontrado"
}

# Crear entorno virtual Python
setup_python_venv() {
    log_info "Configurando entorno virtual Python..."
    
    if [ -d "venv" ]; then
        log_warning "Directorio 'venv' ya existe. Saltando creación..."
    else
        python3 -m venv venv
        log_success "Entorno virtual creado"
    fi
    
    # Activar venv
    source venv/bin/activate
    log_success "Entorno virtual activado"
    
    # Actualizar pip
    log_info "Actualizando pip, setuptools, wheel..."
    pip install --quiet --upgrade pip setuptools wheel
    log_success "Herramientas actualizadas"
}

# Instalar dependencias Python
install_python_deps() {
    log_info "Instalando dependencias Python..."
    
    if [ -f "requirements.txt" ]; then
        pip install --quiet -r requirements.txt
        log_success "Dependencias Python instaladas"
    else
        log_error "requirements.txt no encontrado"
        exit 1
    fi
    
    # Opcional: instalar dependencias de desarrollo
    read -p "¿Instalar dependencias de desarrollo (pytest, black, flake8)? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if [ -f "requirements-dev.txt" ]; then
            pip install --quiet -r requirements-dev.txt
            log_success "Dependencias de desarrollo instaladas"
        fi
    fi
}

# Instalar dependencias Node.js
install_node_deps() {
    if [ "$SKIP_FRONTEND" = true ]; then
        log_warning "Saltando instalación de dependencias Node.js"
        return
    fi
    
    log_info "Instalando dependencias Node.js..."
    
    if [ -f "package.json" ]; then
        npm ci || npm install
        log_success "Dependencias Node.js instaladas"
    else
        log_error "package.json no encontrado"
        exit 1
    fi
}

# Configurar archivos de entorno
setup_env_files() {
    log_info "Configurando archivos de entorno..."
    
    if [ -f ".env" ]; then
        log_warning "Archivo '.env' ya existe. Saltando creación..."
    else
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Archivo '.env' creado desde '.env.example'"
            log_warning "⚠️  Por favor, edita .env con tu configuración real"
            log_warning "   XLN_HOST debe ser la IP de tu fuente de alimentación"
        else
            log_error ".env.example no encontrado"
        fi
    fi
}

# Instalar drivers MCC (solo Raspberry Pi)
install_mcc_drivers() {
    if [ "$SKIP_MCC" = true ]; then
        log_warning "Saltando instalación de drivers MCC"
        return
    fi
    
    log_info "Verificando drivers MCC Linux..."
    
    if command -v test-usb5203 &> /dev/null; then
        log_success "Drivers MCC ya están instalados"
        return
    fi
    
    read -p "¿Instalar drivers MCC Linux para USB-5203? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        log_warning "Saltando instalación de drivers MCC"
        SKIP_MCC=true
        return
    fi
    
    log_info "Descargando drivers MCC Linux..."
    
    # Crear directorio temporal
    TMPDIR=$(mktemp -d)
    cd "$TMPDIR"
    
    # Descargar
    wget -q https://github.com/warrenjasper/Linux_Drivers/archive/master.zip
    unzip -q master.zip
    cd Linux_Drivers-master/USB/python
    
    # Compilar e instalar (requiere sudo)
    log_info "Compilando drivers (requiere sudo)..."
    sudo make install > /dev/null 2>&1
    
    # Limpiar
    cd /
    rm -rf "$TMPDIR"
    
    # Verificar instalación
    if command -v test-usb5203 &> /dev/null; then
        log_success "Drivers MCC instalados correctamente"
    else
        log_warning "No se pudo instalar drivers MCC automáticamente"
        log_info "Intenta manualmente:"
        echo "    cd /tmp"
        echo "    wget https://github.com/warrenjasper/Linux_Drivers/archive/master.zip"
        echo "    unzip master.zip"
        echo "    cd Linux_Drivers-master/USB/python"
        echo "    sudo make install"
    fi
}

# Validar instalación
validate_installation() {
    log_info "Validando instalación..."
    
    source venv/bin/activate
    
    # Test import Python
    if python3 -c "from fuente_xln import FuenteXLN; from daq_usb5203 import DAQUSB5203; from relay_controller import RelayController; from thermal_experiment import ThermalExperiment" 2>/dev/null; then
        log_success "Módulos Python importan correctamente"
    else
        log_error "Error importando módulos Python"
        exit 1
    fi
    
    # Test Node.js
    if [ "$SKIP_FRONTEND" != true ]; then
        if npm ls > /dev/null 2>&1; then
            log_success "Dependencias Node.js validadas"
        else
            log_error "Error en dependencias Node.js"
            exit 1
        fi
    fi
}

# Mostrar instrucciones finales
show_next_steps() {
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}Instalación completada!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "Próximos pasos:"
    echo ""
    echo "1. Editar archivo de configuración:"
    echo "   nano .env"
    echo ""
    echo "2. Iniciar servidor de desarrollo:"
    echo "   Terminal 1 (Backend):"
    echo "     source venv/bin/activate"
    echo "     python3 labpipanel.py"
    echo ""
    if [ "$SKIP_FRONTEND" != true ]; then
        echo "   Terminal 2 (Frontend):"
        echo "     npm run dev"
        echo ""
    fi
    echo "3. Abrir en navegador:"
    echo "   http://localhost:3000"
    echo ""
    echo "4. Ejecutar tests:"
    echo "   pytest tests/unit/ -v"
    echo ""
    echo "5. Construir Docker (opcional):"
    echo "   docker build -t labpipanel:latest ."
    echo ""
    echo -e "${YELLOW}Documentación: Ver README.md, HARDWARE.md, API.md${NC}"
    echo ""
}

# ============================================================
# MAIN
# ============================================================

main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  LabPiPanel - Installation Script                          ║"
    echo "║  Instituto Tecnológico Metropolitano (ITM)                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    # Ejecutar instalación
    check_prerequisites
    setup_python_venv
    install_python_deps
    install_node_deps
    setup_env_files
    install_mcc_drivers
    validate_installation
    show_next_steps
}

# Ejecutar
main
