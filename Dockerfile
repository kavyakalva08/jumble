FROM node:22-slim

# Tools needed to compile better-sqlite3 if no prebuilt binary is available
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
ENV DB_PATH=/data/game.db
EXPOSE 3000

CMD ["node", "server.js"]