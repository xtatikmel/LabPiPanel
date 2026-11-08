.PHONY: help install install-backend install-frontend dev backend frontend build test lint clean docker-build docker-up docker-down

PYTHON ?= python3
VENV := apps/backend/.venv

help:
	@echo "LabPiPanel - comandos disponibles"
	@echo "================================="
	@echo "  make install          Instala backend y frontend"
	@echo "  make install-backend  Crea el venv e instala dependencias Python"
	@echo "  make install-frontend Instala dependencias Node"
	@echo "  make dev              Arranca backend + frontend en desarrollo"
	@echo "  make backend          Arranca solo el backend (5000)"
	@echo "  make frontend         Arranca solo el frontend (5173)"
	@echo "  make build            Compila el frontend para producción"
	@echo "  make test             Ejecuta los tests del backend"
	@echo "  make lint             Ejecuta ESLint"
	@echo "  make clean            Elimina cachés y artefactos"
	@echo "  make docker-build     Construye la imagen"
	@echo "  make docker-up        Levanta docker compose"
	@echo "  make docker-down      Detiene docker compose"

install: install-backend install-frontend

install-backend:
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/python -m pip install --upgrade pip
	$(VENV)/bin/python -m pip install -r apps/backend/requirements-dev.txt

install-frontend:
	cd apps/frontend && npm ci

dev:
	./scripts/start-dev.sh

backend:
	cd apps/backend && .venv/bin/python app.py

frontend:
	cd apps/frontend && npm run dev

build:
	cd apps/frontend && npm run build

test:
	cd apps/backend && .venv/bin/python -m pytest

lint:
	cd apps/frontend && npm run lint

clean:
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name .pytest_cache -prune -exec rm -rf {} +
	rm -rf apps/frontend/dist apps/frontend/.vite

docker-build:
	docker build -t labpipanel:latest .

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

.DEFAULT_GOAL := help
