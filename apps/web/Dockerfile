FROM node:20-slim AS builder
RUN corepack enable
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm --filter @en/tracker build
RUN pnpm --filter @en/web build

FROM nginx:stable-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
