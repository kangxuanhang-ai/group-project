FROM node:20-slim AS builder
RUN corepack enable && \
    apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY . .
RUN pnpm install --frozen-lockfile

RUN cd server && npx prisma generate && pnpm run build

FROM node:20-slim
RUN corepack enable && \
    apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=builder /app ./

EXPOSE 3000
CMD ["node", "server/dist/apps/server/apps/server/src/main.js"]
