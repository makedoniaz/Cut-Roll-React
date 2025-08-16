# 1. Stage: build app
FROM node:20-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект и собираем
COPY . .
RUN npm run build

# 2. Stage: serve with nginx
FROM nginx:1.27-alpine

# Удаляем дефолтный nginx конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем свой nginx конфиг
COPY nginx.conf /etc/nginx/conf.d

# Копируем собранный билд
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
