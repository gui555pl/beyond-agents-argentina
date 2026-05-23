# syntax=docker/dockerfile:1.7

# ─── Stage 1: deps + native build (better-sqlite3) ───────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

# Inclui devDeps porque o entrypoint roda via `tsx` (devDep).
# Em troca de imagem maior (~250MB), evitamos um stage de compile TS.
RUN npm ci --include=dev

# ─── Stage 2: runtime ─────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

# libstdc++ runtime para better-sqlite3 (native binding compilada acima).
RUN apk add --no-cache libstdc++ libc6-compat

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4001 \
    DATABASE_PATH=/data/runs.sqlite

# node_modules vem prontos do stage anterior (com binding nativo já compilado).
COPY --from=deps /app/node_modules ./node_modules

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
COPY public ./public

# Volume Fly.io é montado em /data. Mkdir defensivo se rodar sem volume.
RUN mkdir -p /data

EXPOSE 4001

# Health check usa o endpoint /api/health que já existe no server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:4001/api/health || exit 1

# Rodamos com `npx tsx` direto — sem build TS, sem `mastra build`.
# O server.ts é o entrypoint (Express + SSE + worker pool).
CMD ["npx", "tsx", "src/server.ts"]
