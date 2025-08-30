# etap build
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ustaw zmienną środowiskową dla builda
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

# etap serwowania
FROM nginx:1.25
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
