# ─────────────────────────────────────────────
# Stage 1: Build the React/Node frontend
# ─────────────────────────────────────────────
FROM node:22-alpine AS web-builder

WORKDIR /app/web

# Install dependencies
COPY web/package*.json ./
RUN npm install

# Copy the rest of the web source and build
COPY web/ ./
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Python / FastAPI production image
# ─────────────────────────────────────────────
FROM python:3.11-slim AS backend

# Keeps Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install uv for fast dependency installation
RUN pip install --no-cache-dir uv

# Copy dependency manifests first (layer-cache friendly)
COPY pyproject.toml uv.lock ./

# Install Python dependencies (no venv inside container — system install)
RUN uv sync --frozen --no-dev

# Copy application source
COPY app/     ./app/
COPY main.py  ./main.py

# Copy the compiled frontend from Stage 1 into the location
# FastAPI's StaticFiles mount expects (adjust path if yours differs)
COPY --from=web-builder /app/web/dist ./web/dist

# SQLite database will live in /data so it can be volume-mounted
RUN mkdir -p /data
ENV DATABASE_URL=sqlite:////data/voicequest.db

# Expose the port uvicorn/FastAPI listens on
EXPOSE 8000

# Run with uvicorn directly (fastapi dev is for local dev only)
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]