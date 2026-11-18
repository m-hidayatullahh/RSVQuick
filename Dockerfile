# Tahap 1: build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc* ./
RUN npm ci

COPY . .

# Variabel VITE_* dibaca saat build (di-inline oleh Vite), bukan saat container jalan.
# .env tidak ter-copy ke container (lihat .dockerignore) — nilai disuplai via build args
# dari docker-compose.yml, yang baca dari .env host via ${VAR} substitution.
ARG VITE_SUPABASE_PROJECT_URL
ARG VITE_SUPABASE_KEY
ARG VITE_APP_URL
ARG VITE_SITE_URL
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_PLAUSIBLE_DOMAIN
ARG VITE_PLAUSIBLE_HOST
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ENV
ENV VITE_SUPABASE_PROJECT_URL=$VITE_SUPABASE_PROJECT_URL \
    VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY \
    VITE_PLAUSIBLE_DOMAIN=$VITE_PLAUSIBLE_DOMAIN \
    VITE_PLAUSIBLE_HOST=$VITE_PLAUSIBLE_HOST \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_SENTRY_ENV=$VITE_SENTRY_ENV

RUN npm run build

# Tahap 2: serve dengan nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
