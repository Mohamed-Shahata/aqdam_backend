"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const config_1 = require("@nestjs/config");
const constant_1 = require("../../../utils/constant");
const cloudinary_1 = require("cloudinary");
exports.CloudinaryProvider = {
    provide: constant_1.CLOUDINARY,
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        return cloudinary_1.v2.config({
            cloud_name: config.get("CLOUD_NAME"),
            api_key: config.get("CLOUD_API_KEY"),
            api_secret: config.get("CLOUD_API_SECRET")
        });
    }
};
//# sourceMappingURL=cloudinary.provider.js.map