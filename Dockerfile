# Tahap 1: build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc* ./
RUN npm ci

COPY . .

# Variabel VITE_* dibaca saat build, bukan saat container jalan
ARG VITE_SUPABASE_PROJECT_URL
ARG VITE_SUPABASE_KEY
ARG VITE_APP_URL
ENV VITE_SUPABASE_PROJECT_URL=$VITE_SUPABASE_PROJECT_URL \
    VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY \
    VITE_APP_URL=$VITE_APP_URL

RUN npm run build

# Tahap 2: serve dengan nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]