FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y tzdata

COPY package.json package-lock.json ./
RUN npm install

COPY ./src ./src
COPY ./prisma ./prisma

ENV TZ=Europe/Warsaw

RUN npx prisma generate

CMD ["npm", "run", "dev"]
