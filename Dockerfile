FROM node:18-alpine

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 3000

CMD ["npm", "start"]
