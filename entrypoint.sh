#!/bin/bash
set -e

echo "🚀 Starting Resume Backend with Cloudflare Tunnel..."

# Start cloudflared tunnel in background (if token is provided)
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "🌐 Starting Cloudflare Tunnel..."
    cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
    TUNNEL_PID=$!
    echo "🌐 Cloudflare Tunnel started (PID: $TUNNEL_PID)"
else
    echo "⚠️  No CLOUDFLARE_TUNNEL_TOKEN provided, skipping tunnel"
fi

# Start the backend (this will also serve the static frontend)
echo "🔧 Starting Bun backend..."
exec bun run compute/main.ts
