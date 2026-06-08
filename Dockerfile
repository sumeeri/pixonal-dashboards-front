FROM --platform=linux/amd64 node:20-alpine3.18 AS build

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

FROM --platform=linux/amd64 nginxinc/nginx-unprivileged:1.25

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
