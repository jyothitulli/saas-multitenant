FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]