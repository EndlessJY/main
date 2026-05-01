FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY . .

EXPOSE 3000 6060

CMD ["npm", "start"]
