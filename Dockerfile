FROM node:18-alpine

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY nginx.conf /etc/nginx/nginx.conf.template

EXPOSE 8080

CMD sh -c "\
  envsubst '\$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
  nginx && \
  node src/app.js"
