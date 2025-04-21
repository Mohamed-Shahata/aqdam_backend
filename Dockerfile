# استخدام صورة Node.js الأساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملف package.json و package-lock.json أو yarn.lock
COPY package*.json ./

# تثبيت التبعيات (بما في ذلك NestJS CLI)
RUN npm install --production

# تثبيت NestJS CLI عالميًا لكي يعمل الأمر 'nest'
RUN npm install -g @nestjs/cli

# نسخ باقي الملفات
COPY . .

# بناء التطبيق
RUN npm run build

# تعيين المنفذ الذي سيعمل عليه التطبيق
EXPOSE 5000

# بدء التطبيق في بيئة الإنتاج
CMD ["npm", "run", "start:prod"]
