# ⚙️ Aqdam Backend

Backend server built with **NestJS** and **TypeScript**, designed for modularity, performance, and scalability.  
Includes features like authentication, mailing, file uploads (Cloudinary), scheduling, and real-time communication via WebSockets.

---

## 🚀 Tech Stack

- **Framework:** NestJS (v11)  
- **Language:** TypeScript  
- **Database:** PostgreSQL (via TypeORM)  
- **Cache / Queue:** Redis (ioredis)  
- **Authentication:** JWT (Access + Refresh Tokens)  
- **Storage:** AWS S3 / Cloudinary  
- **Mail Service:** Nodemailer (with EJS templates)  
- **Security:** Helmet, CORS, Throttling  
- **Realtime:** Socket.IO  
- **Validation:** class-validator + class-transformer  
- **Testing:** Jest (E2E & Unit Tests)  

---

## 📁 Project Structure

```bash
aqdam_backend/
│
├── src/
│   ├── modules/           # App modules (auth, user, mail, etc.)
│   ├── config/            # Environment and configuration setup
│   ├── common/            # Common decorators, filters, guards
│   ├── interceptors/      # Global interceptors
│   ├── main.ts            # App entry point
│   └── app.module.ts      # Root module
│
├── test/                  # Jest test files
├── dist/                  # Compiled JS output
├── nest-cli.json          # NestJS CLI configuration
├── tsconfig.json          # TypeScript configuration
├── package.json
└── .env
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```bash
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=aqdam_db

# JWT
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1h
REFRESH_SECRET=refresh_secret_key
REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=yourpassword
```

---

## 🧠 Available Scripts

| Command | Description |
|----------|-------------|
| `npm run start` | Start the production build |
| `npm run start:dev` | Run development server (watch mode) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end (E2E) tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🔐 Features

✅ Authentication & Authorization (JWT)  
✅ Email Verification & Password Reset  
✅ File Upload (AWS S3 / Cloudinary)  
✅ Real-Time Notifications (Socket.io)  
✅ Rate Limiting & Security Middleware  
✅ Cron Jobs (nestjs/schedule)  
✅ Redis caching & throttling  
✅ Modular Architecture for scalability  

---

## 🧩 Development Setup

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Run in dev mode
```bash
npm run start:dev
```

### 3️⃣ Build for production
```bash
npm run build
```

### 4️⃣ Run E2E tests
```bash
npm run test:e2e
```

---

## 🧑‍💻 Author

**Mohamed**  
📧 [mohamedmrslan@gmail.com]
