# ---------- STAGE 1: BUILD ----------
FROM node:20-alpine AS build

WORKDIR /app

# Instala curl al principio para aprovechar la caché de capas de Docker
RUN apk add --no-cache curl

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- STAGE 2: RUNTIME ----------
FROM nginx:1.27-alpine

# Instala curl al principio de esta etapa también
RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
