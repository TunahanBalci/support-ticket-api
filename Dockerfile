# build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY src/data/ ./src/data/
COPY config ./config/
COPY tsconfig.json ./

RUN npm install 
RUN npx prisma generate

COPY . .

RUN npm run build

# production stage
FROM node:20-slim AS production

WORKDIR /app

# copy built directories from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/src/config/swagger.json ./dist/config/swagger.json

RUN apt-get update -y && apt-get install -y openssl netcat-openbsd && \
    npm install && \
    npx prisma generate && \
    npm cache clean --force

ENV NODE_ENV=production

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8000
ENTRYPOINT ["./start.sh"]


CMD ["npm", "start"]
