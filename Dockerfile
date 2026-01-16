FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

# Buat folder kerja
WORKDIR /app

# Install dependencies node
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose nginx port
EXPOSE 80

# Jalankan nginx + node
CMD sh -c "nginx && node src/app.js"
