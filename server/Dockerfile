FROM node:21-alpine AS backend

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4999

CMD ["npm", "start"]

