FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache nginx python3 make g++ curl

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx log directory
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chmod 644 /var/log/nginx/*.log

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 80

# Start both nginx and node
CMD sh -c "nginx -g 'daemon off;' & node src/app.js"