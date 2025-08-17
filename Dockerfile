# 1. Stage: build app
FROM node:20-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем проект и собираем
COPY . .
RUN npm run build

# 2. Stage: serve static files with 'serve'
FROM node:20-alpine

WORKDIR /app

# Устанавливаем лёгкий сервер для статики
RUN npm install -g serve

# Копируем только собранный билд
COPY --from=build /app/dist ./dist

EXPOSE 80

# Запускаем сервер на порту 80
CMD ["serve", "-s", "dist", "-l", "80"]
