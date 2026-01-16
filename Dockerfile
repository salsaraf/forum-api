FROM node:18-alpine

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy nginx template
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 8080

CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && nginx && node src/app.js"
