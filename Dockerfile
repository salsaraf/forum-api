FROM node:18-alpine

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["npm", "start"]
