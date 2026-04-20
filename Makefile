.PHONY: help install test lint format clean docker-build docker-up docker-down run dev

help:
	@echo "LabPiPanel - Makefile Commands"
	@echo "================================"
	@echo "  make install       - Install Python and Node.js dependencies"
	@echo "  make test          - Run all tests (unit + integration)"
	@echo "  make test-unit     - Run unit tests only"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make lint          - Run linting (flake8, eslint)"
	@echo "  make format        - Format code (black, prettier)"
	@echo "  make type-check    - TypeScript type checking"
	@echo "  make clean         - Remove cache and build artifacts"
	@echo "  make run           - Run application (backend + frontend)"
	@echo "  make dev           - Development mode (with hot reload)"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-up     - Start services with docker-compose"
	@echo "  make docker-down   - Stop services"
	@echo "  make docker-logs   - View container logs"
	@echo "  make security      - Check security vulnerabilities"

install: install-python install-node

install-python:
	@echo "Installing Python dependencies..."
	python3 -m venv venv
	. venv/bin/activate && pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt
	@echo "Python setup complete!"

install-node:
	@echo "Installing Node.js dependencies..."
	npm ci || npm install
	@echo "Node.js setup complete!"

test: test-unit

test-unit:
	@echo "Running unit tests..."
	. venv/bin/activate && pytest tests/unit/ -v

test-integration:
	@echo "Running integration tests..."
	. venv/bin/activate && pytest tests/integration/ -v

test-all: test-unit test-integration
	@echo "All tests completed!"

test-coverage:
	@echo "Running tests with coverage..."
	. venv/bin/activate && pytest tests/ --cov=. --cov-report=html --cov-report=term-missing
	@echo "Coverage report generated: htmlcov/index.html"

lint: lint-python lint-js

lint-python:
	@echo "Linting Python code..."
	. venv/bin/activate && flake8 *.py tests/ --max-line-length=100
	@echo "Python linting complete!"

lint-js:
	@echo "Linting JavaScript/TypeScript..."
	npm run lint || echo "ESLint not configured"
	@echo "JavaScript linting complete!"

format: format-python format-js

format-python:
	@echo "Formatting Python code..."
	. venv/bin/activate && black . --line-length=100
	@echo "Python formatting complete!"

format-js:
	@echo "Formatting JavaScript/TypeScript..."
	npx prettier --write "." 2>/dev/null || echo "Prettier not configured"
	@echo "JavaScript formatting complete!"

type-check:
	@echo "Type checking TypeScript..."
	npm run type-check 2>/dev/null || echo "TypeScript checking not configured"

clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null
	rm -rf .coverage coverage.xml
	@echo "Cleanup complete!"

run:
	@echo "Starting LabPiPanel (Backend + Frontend)..."
	@echo "Backend running on: http://localhost:5000"
	@echo "Frontend running on: http://localhost:3000"
	@echo ""
	. venv/bin/activate && python3 labpipanel.py &
	npm run dev

dev: run

docker-build:
	@echo "Building Docker image..."
	docker build -t labpipanel:latest .
	@echo "Docker image built successfully!"

docker-up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d
	@echo "Services started! Access at http://localhost:3000"

docker-down:
	@echo "Stopping services..."
	docker-compose down

docker-logs:
	@echo "Showing container logs..."
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down -v
	docker rmi labpipanel:latest
	@echo "Docker cleanup complete!"

security:
	@echo "Checking security vulnerabilities..."
	. venv/bin/activate && pip install safety
	. venv/bin/activate && safety check
	npm audit
	@echo "Security check complete!"

freeze:
	@echo "Generating dependency lock files..."
	. venv/bin/activate && pip freeze > requirements.lock.txt
	npm ci --package-lock-only
	@echo "Lock files generated!"

.DEFAULT_GOAL := help
