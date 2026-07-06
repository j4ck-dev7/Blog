FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN mkdir -p logs/seguranca logs/tratadas

ARG POSTGRES_URL
ENV POSTGRES_URL=${POSTGRES_URL}
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "./server.js"]
