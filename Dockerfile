# build stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY src/data/schema.prisma ./src/data/
COPY config ./config/

RUN npm install

RUN npx prisma generate --schema=./src/data/schema.prisma

COPY . .

RUN npm run build

# production stage
FROM node:20 AS production

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/src/data/schema.prisma ./src/data/schema.prisma

RUN apt-get update -y && apt-get install -y openssl && \
    npm install && \
    npx prisma generate --schema=./src/data/schema.prisma && \
    npm cache clean --force

ENV NODE_ENV=production

# copy built directories from build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/src/config/swagger.json ./dist/config/swagger.json

EXPOSE 8000
CMD ["npm", "start"]
