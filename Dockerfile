FROM node:18-alpine

RUN apk add --no-cache nginx

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD sh -c "nginx && node src/app.js"
