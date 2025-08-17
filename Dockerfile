# 1. Stage: build app
FROM node:20-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект и собираем
COPY . .
RUN npm run build