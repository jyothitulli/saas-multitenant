FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Use --network-timeout to prevent the ECONNRESET error
RUN npm install --network-timeout=100000
COPY . .
ENV REACT_APP_API_URL=http://localhost:5000/api
EXPOSE 3000
CMD ["npm", "start"]