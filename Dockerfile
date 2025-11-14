# Используем официальный образ Playwright с Node.js
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Устанавливаем системные зависимости для Playwright
RUN npx playwright install-deps

# Копируем весь проект
COPY . .

# Опционально: создаем папку для дампа
RUN mkdir -p /app/tutu_dump

# Команда по умолчанию (можно переопределить при запуске)
CMD ["node", "crawl_tutu_optimized.js", "./tutu_dump"]
