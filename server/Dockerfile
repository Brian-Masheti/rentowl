# Use official Node.js LTS image
FROM node:18

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --prod

COPY . .
COPY .env .env

EXPOSE 5000
CMD ["node", "src/server.js"]