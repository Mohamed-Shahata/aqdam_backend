# استخدم صورة Node.js v18 (نفس الإصدار اللي في اللوجز بتاعتك)
FROM node:18

# ضبط مجلد العمل داخل الكونتينر
WORKDIR /app

# نسخ ملفات package.json و package-lock.json
COPY package*.json ./

# تثبيت الـ dependencies (من غير devDependencies)
RUN npm install --omit=dev

# نسخ باقي ملفات المشروع
COPY . .

# تشغيل الـ build عشان يترجم TypeScript إلى JavaScript
RUN npm run build

# تشغيل التطبيق باستخدام start:prod
CMD ["npm", "run", "start:prod"]