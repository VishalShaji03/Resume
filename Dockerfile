# =============================================================================
# Stage 1: Build Next.js Frontend (Static Export)
# =============================================================================
FROM oven/bun:latest AS frontend

WORKDIR /frontend

# Install dependencies first (better caching)
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy source and build
COPY web/ ./

# Build static export
RUN bun run build

# =============================================================================
# Stage 2: Production Runtime
# =============================================================================
FROM oven/bun:latest

# Install system dependencies & Git & cloudflared
RUN apt-get update && apt-get install -y \
    curl \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu-dev \
    libssl-dev \
    libssl3 \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic (Fast LaTeX engine)
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh \
    && mv tectonic /usr/local/bin/

# Install cloudflared
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared

WORKDIR /app

# Bun dependencies for backend
COPY compute/package.json ./
RUN bun install

# Copy backend source
COPY compute/ ./compute/

# Copy base resume
COPY resume.tex .

# Copy built frontend (static files)
COPY --from=frontend /frontend/out ./public

# Pre-warm Tectonic (download TeX bundles at build time)
RUN tectonic resume.tex && rm resume.pdf

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Set production environment
ENV NODE_ENV=production

EXPOSE 8000

# Use entrypoint script to start both cloudflared and backend
CMD ["./entrypoint.sh"]