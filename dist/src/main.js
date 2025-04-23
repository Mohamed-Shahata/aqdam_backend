"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const compression = require("compression");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.use(compression());
    app.enableCors({
        origin: 'https://aqdam-git-aqdam-mohameds-projects-f5551999.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        forbidNonWhitelisted: true,
        whitelist: true,
        transform: true,
    }));
    await app.listen(process.env.PORT || 5000, "0.0.0.0");
}
bootstrap();
//# sourceMappingURL=main.js.map