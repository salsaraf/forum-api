FROM node:18-alpine

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY nginx.conf /etc/nginx/nginx.conf.template

RUN mkdir -p /var/run/nginx && \
    chmod 777 /var/run/nginx

CMD sh -c "\
  echo 'Starting NGINX with PORT=$PORT' && \
  envsubst '\$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
  echo 'NGINX configuration generated' && \
  cat /etc/nginx/nginx.conf && \
  echo 'Starting Node.js application...' && \
  node src/app.js & \
  echo 'Starting NGINX...' && \
  nginx -g 'daemon off;'"