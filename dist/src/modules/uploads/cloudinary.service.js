"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const toStream = require("buffer-to-stream");
let CloudinaryService = class CloudinaryService {
    async uploadImage(file, folder = "uploads") {
        return new Promise((resolve, rejects) => {
            if (file.size > 2000000) {
                return rejects(new common_1.BadRequestException("size image is bigger"));
            }
            ;
            if (!file.mimetype.startsWith("image")) {
                return rejects(new common_1.BadRequestException("invalid format"));
            }
            ;
            const upload = cloudinary_1.v2.uploader.upload_stream({ folder }, (err, result) => {
                if (err)
                    return rejects(err);
                resolve(result);
            });
            toStream(file.buffer).pipe(upload);
        });
    }
    ;
    async deleteImage(publicId) {
        return new Promise((resolve, rejects) => {
            cloudinary_1.v2.uploader.destroy(publicId, (err, result) => {
                if (err)
                    return rejects(err);
                resolve(result);
            });
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map