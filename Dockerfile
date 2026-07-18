# ── Stage 1 : builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

COPY . .

# ── Stage 2 : runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Crée un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copie uniquement les fichiers nécessaires depuis le builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
