FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend
ENV NODE_ENV=development
COPY aksespintar-frontend/package.json aksespintar-frontend/package-lock.json ./
RUN npm ci --include=dev
COPY aksespintar-frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS backend
WORKDIR /app/backend
ENV NODE_ENV=development
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY aksespintar-backend/package.json aksespintar-backend/package-lock.json ./
RUN npm ci --include=dev
COPY aksespintar-backend/prisma ./prisma
COPY aksespintar-backend/prisma.config.ts ./
RUN npx prisma generate
COPY aksespintar-backend/tsconfig.json ./
COPY aksespintar-backend/src ./src
RUN npm run build
COPY --from=frontend /app/frontend/dist /app/frontend/dist
ENV NODE_ENV=production
ENV FRONTEND_DIST=/app/frontend/dist
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && if [ -n \"$SEED_ADMIN_EMAIL\" ] && [ -n \"$SEED_ADMIN_PASSWORD\" ]; then npx prisma db seed; fi && node dist/server.js"]
