# syntax=docker/dockerfile:1

# ============================================================
# STAGE 1: build del frontend React/Vite
# ============================================================
FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /app

COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci

COPY apps/frontend/ ./
RUN npm run build

# ============================================================
# STAGE 2: backend Flask + frontend compilado
# ============================================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=5000

WORKDIR /app

COPY apps/backend/requirements.txt ./apps/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r apps/backend/requirements.txt

COPY apps/backend/ ./apps/backend/
COPY --from=frontend-builder /app/dist ./apps/frontend/dist

WORKDIR /app/apps/backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/api/status', timeout=3)"

CMD ["python", "app.py"]
