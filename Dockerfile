FROM node:18-alpine

RUN apk add --no-cache nginx

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

COPY nginx.conf /etc/nginx/nginx.conf

# Kita tidak menggunakan ENV PORT=5000 di sini agar tidak konflik dengan Railway
EXPOSE 8080

# Jalankan node di port 5000 (sesuai perubahan di app.js) 
# dan Nginx di port 8080 (sesuai listen 8080 di nginx.conf)
CMD sh -c "node src/app.js & nginx -g 'daemon off;'"