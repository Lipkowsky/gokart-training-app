FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./prisma ./prisma

# Generowanie klienta Prisma
RUN npx prisma generate

# Domyślnie Node używa production dependencies, możesz ograniczyć wielkość obrazu
ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
