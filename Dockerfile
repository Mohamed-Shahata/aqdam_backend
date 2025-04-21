# اختيار صورة الأساس (Base image)
FROM node:18-alpine

# تعيين مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ الملفات إلى الحاوية
COPY package*.json ./

# تثبيت التبعيات
RUN npm install --production

# نسخ باقي ملفات التطبيق
COPY . .

# بناء التطبيق إذا لزم الأمر (إذا كان لديك TypeScript أو بنية خاصة)
RUN npm run build

# تعيين المنفذ الذي سيعمل عليه التطبيق
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "run", "start:prod"]
