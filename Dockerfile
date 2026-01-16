FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy config nginx kita ke dalam path konfigurasi nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Port aplikasi internal
ENV PORT=5000
# Port yang akan dibuka ke publik oleh Railway
EXPOSE 8080

# Menjalankan aplikasi Node.js (&) lalu menjalankan Nginx di foreground
CMD sh -c "node src/app.js & nginx -g 'daemon off;'"