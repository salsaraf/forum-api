FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

# Setup direktori yang dibutuhkan Nginx
RUN mkdir -p /run/nginx

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy config nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Teruskan log nginx ke stdout/stderr Railway
RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 8080

# Jalankan node dan nginx secara bersamaan
CMD sh -c "node src/app.js & sleep 5 && nginx -g 'daemon off;'