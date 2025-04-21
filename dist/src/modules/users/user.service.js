"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const typeorm_2 = require("typeorm");
const cloudinary_service_1 = require("../uploads/cloudinary.service");
const enum_roles_1 = require("../../utils/enum.roles");
const redis_service_1 = require("../redis/redis.service");
let UserService = class UserService {
    userRepository;
    cloudinaryService;
    redisService;
    constructor(userRepository, cloudinaryService, redisService) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.redisService = redisService;
    }
    ;
    async getAll(search) {
        const query = this.userRepository.createQueryBuilder('user');
        if (search) {
            query.where('LOWER(user.firstName) LIKE LOWER(:search)', { search: `%${search}%` })
                .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', { search: `%${search}%` });
        }
        return query.getMany();
    }
    async getAllPeople(search, page = 1, pageSize = 20) {
        page = Math.max(1, page);
        pageSize = Math.max(1, Math.min(pageSize, 100));
        const query = this.userRepository.createQueryBuilder('user');
        if (search && search.trim()) {
            query
                .where('LOWER(user.firstName) LIKE LOWER(:search)', { search: `%${search.trim()}%` })
                .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', { search: `%${search.trim()}%` });
        }
        query.orderBy('user.id', 'ASC');
        const skip = (page - 1) * pageSize;
        query.skip(skip).take(pageSize);
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async getOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['age', 'bio', 'firstName', 'lastName', 'id', 'point', 'profileImage']
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    ;
    async getOneUserCache(id) {
        const cacheKey = `user_${id}`;
        try {
            const cachePostUser = await this.redisService.get(cacheKey);
            if (cachePostUser) {
                try {
                    console.log(cachePostUser);
                    const parsed = JSON.parse(cachePostUser);
                    if (parsed && typeof parsed === 'object') {
                        return parsed;
                    }
                }
                catch (error) {
                    console.error(`Redis cache parse error for key ${cacheKey}:`, error);
                }
            }
            const user = await this.getOne(id);
            if (!user) {
                throw new common_1.NotFoundException("User not found");
            }
            await this.redisService.set(cacheKey, JSON.stringify(user), 300);
            return { data: user };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error(`Error fetching user with id ${id}:`, error);
            throw new common_1.InternalServerErrorException("Failed to fetch user");
        }
    }
    async getMe(id) {
        const user = await this.getOne(id);
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    ;
    async update(payload, dto) {
        const { firstName, lastName, age, bio } = dto;
        const user = await this.getOne(payload.id);
        await this.userRepository.update(payload.id, { firstName, lastName, age, bio });
        await this.redisService.delete(`user_${user.id}`);
        return this.getOne(user.id);
    }
    ;
    async delete(payload) {
        const user = await this.getOne(payload.id);
        if (user.id === payload.id || payload.role === enum_roles_1.UserRole.ADMIN) {
            await this.cloudinaryService.deleteImage(user.imagePublicId);
            await this.userRepository.remove(user);
            await this.redisService.delete(`user_${user.id}`);
            return { message: "Delete user success" };
        }
        throw new common_1.ForbiddenException("access denaid, you are not allowed");
    }
    ;
    async uploadImage(payload, file) {
        const user = await this.getOne(payload.id);
        if (user.profileImage !== null) {
            await this.cloudinaryService.deleteImage(user.imagePublicId);
        }
        ;
        const result = await this.cloudinaryService.uploadImage(file, "users");
        user.profileImage = result.secure_url;
        user.imagePublicId = result.public_id;
        await this.redisService.delete(`user_${user.id}`);
        return await this.userRepository.save(user);
    }
    async deleteImage(payload) {
        const user = await this.getOne(payload.id);
        if (user.profileImage !== null) {
            await this.cloudinaryService.deleteImage(user.imagePublicId);
            user.imagePublicId = null;
            user.profileImage = null;
            await this.redisService.delete(`user_${user.id}`);
        }
        else {
            throw new common_1.BadRequestException("image not found");
        }
        return this.userRepository.save(user);
    }
    ;
    async toggleFollow(id, targetUserId) {
        if (id === targetUserId)
            throw new common_1.BadRequestException("You cannot follow your account.");
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['following']
        });
        const targetUser = await this.userRepository.findOne({ where: { id: targetUserId }, select: ['id'] });
        if (!targetUser)
            throw new common_1.BadRequestException("Target user not found");
        const isFollowing = user?.following.some(user => user.id === targetUserId);
        if (isFollowing && user) {
            user.following = user.following.filter(user => user.id !== targetUserId);
            await this.redisService.deleteByPattern(`user_feed_${user.id}*`);
            await this.redisService.delete(`user_${user.id}`);
            await this.userRepository.save(user);
            return { message: "Unfollowed successfully" };
        }
        else {
            user?.following.push(targetUser);
            await this.redisService.deleteByPattern(`user_feed_${user?.id}*`);
            await this.redisService.delete(`user_${user?.id}`);
            await this.userRepository.save(user);
            return { message: "Followed successfully" };
        }
    }
    async getFollowing(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['following'],
            select: ['following']
        });
        return user?.following;
    }
    async getFollowingMe(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['following'],
            select: ['following']
        });
        return user?.following;
    }
    async getFollowers(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['followers'],
            select: ['followers']
        });
        return user?.followers;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cloudinary_service_1.CloudinaryService,
        redis_service_1.RedisService])
], UserService);
;
//# sourceMappingURL=user.service.js.map