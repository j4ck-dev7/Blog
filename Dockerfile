FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install pm2 -g
RUN POSTGRES_URL="postgresql://user:pass@localhost:5432/db" npm ci

COPY . .

RUN mkdir -p logs/seguranca logs/tratadas

RUN POSTGRES_URL="postgresql://user:pass@localhost:5432/db" npx prisma generate

EXPOSE 5000

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]