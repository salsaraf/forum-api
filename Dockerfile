FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

# Set working directory
WORKDIR /app

# Copy node files
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose PORT dari Railway
ENV NODE_ENV=production
ENV PORT=8080

# Start both nginx & node
CMD sh -c "node src/app.js & nginx -g 'daemon off;'"
