FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y tzdata

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY ./src ./src
COPY ./prisma ./prisma

ENV TZ=Europe/Warsaw

RUN npx prisma generate

# jeśli masz TypeScript, to dodaj build:
# RUN npm run build
# i uruchamiaj dist/index.js zamiast src

CMD ["node", "src/index.js"]
