FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 8080

CMD sh -c "node src/app.js & nginx -g 'daemon off;'"
