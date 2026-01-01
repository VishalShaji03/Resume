FROM oven/bun:1.1-slim

# 1. Install system dependencies for Tectonic
RUN apt-get update && apt-get install -y \
    curl libfontconfig1 libgraphite2-3 libharfbuzz0b \
    libicu-dev libssl-dev ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Tectonic (Fast LaTeX engine)
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh \
    && mv tectonic /usr/local/bin/

WORKDIR /app

# 3. Bun dependencies
COPY compute/package.json compute/bun.lockb ./
RUN bun install --frozen-lockfile

# 4. App Source
COPY compute/ ./compute/
COPY resume.tex .

# 5. Warmup: Run Tectonic during build to bake packages into layers
RUN tectonic resume.tex && rm resume.pdf

EXPOSE 8000
CMD ["bun", "compute/main.ts"]