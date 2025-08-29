# Etap 1: build aplikacji
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etap 2: serwowanie przez nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# domyślny config nginx wystarczy, chyba że potrzebujesz SPA fallback
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
