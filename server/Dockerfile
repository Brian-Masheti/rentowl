# Use official Node.js LTS image
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["node", "src/server.js"]
