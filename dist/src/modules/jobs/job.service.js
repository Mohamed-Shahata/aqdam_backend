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
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const job_entity_1 = require("./job.entity");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../users/user.service");
const enum_roles_1 = require("../../utils/enum.roles");
const user_entity_1 = require("../users/user.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const notification_gateway_1 = require("../notifications/notification.gateway");
const notification_service_1 = require("../notifications/notification.service");
const redis_service_1 = require("../redis/redis.service");
let JobService = class JobService {
    jobRepository;
    userRepository;
    notificationRepository;
    userService;
    notificationGateway;
    notificationService;
    redisService;
    constructor(jobRepository, userRepository, notificationRepository, userService, notificationGateway, notificationService, redisService) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.notificationGateway = notificationGateway;
        this.notificationService = notificationService;
        this.redisService = redisService;
    }
    ;
    getAll() {
        return this.jobRepository.find({ order: { createdAt: "DESC" } });
    }
    ;
    async getAllForUserId(id, page = 1, limit = 5) {
        const user = await this.userService.getOne(id);
        const [jobs, total] = await this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.user', 'user')
            .where('job.userId = :userId', { userId: user.id })
            .orderBy('job.createdAt', 'DESC')
            .select([
            'job.id',
            'job.title',
            'job.extra_info',
            'job.email_applay',
            'job.type',
            'job.requirements',
            'job.createdAt',
            'job.responsibilities',
            'job.short_intro',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.profileImage'
        ])
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: jobs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        };
    }
    ;
    async getOne(id) {
        const job = await this.jobRepository.findOne({ where: { id } });
        if (!job)
            throw new common_1.BadRequestException("Job not found");
        return job;
    }
    async create(userId, dto) {
        const { title, short_intro, responsibilities, requirements, extra_info, email_applay } = dto;
        const user = await this.userService.getOne(userId);
        const newJob = this.jobRepository.create({
            title,
            short_intro,
            responsibilities,
            requirements,
            extra_info,
            email_applay,
            user,
        });
        const followers = await this.userRepository
            .createQueryBuilder("user")
            .innerJoin("user_followers", "uf", "uf.follower_id = user.id AND uf.following_id = :userId", { userId: user.id })
            .getMany();
        const savedJob = await this.jobRepository.save(newJob);
        const notificationTasks = followers
            .filter((follower) => follower.id !== user.id)
            .map(async (follower) => {
            await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            const notification = this.notificationRepository.create({
                message: `${user.firstName} ${user.lastName} posted a new job`,
                job: savedJob,
                recipient: follower,
                isRead: false,
            });
            const savedNotification = await this.notificationRepository.save(notification);
            await this.notificationService.cacheNotification(savedNotification);
            await this.notificationGateway.sendNotification(follower.id, {
                message: notification.message,
                job: savedJob,
            });
        });
        await Promise.all(notificationTasks);
        user.point += 5;
        await this.userRepository.save(user);
        return savedJob;
    }
    async update(payload, jobId, dto) {
        const { title, short_intro, responsibilities, requirements, extra_info, email_applay } = dto;
        const user = await this.userService.getOne(payload.id);
        const job = await this.getOne(jobId);
        if (job.user.id === user.id || user.role === enum_roles_1.UserRole.ADMIN) {
            await this.jobRepository.update(job.id, {
                title,
                short_intro,
                responsibilities,
                requirements,
                extra_info,
                email_applay
            });
            const followers = await this.userRepository
                .createQueryBuilder("user")
                .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
                .getMany();
            const cacheTasks = followers.map(async (follower) => {
                await this.redisService.delete(`notifications:${follower.id}`);
                await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            });
            await Promise.all(cacheTasks);
            return this.getOne(job.id);
        }
        ;
        throw new common_1.ForbiddenException("Can't update this job");
    }
    async delete(payload, jobId) {
        const user = await this.userService.getOne(payload.id);
        const job = await this.getOne(jobId);
        if (job.user.id === user.id || user.role === enum_roles_1.UserRole.ADMIN) {
            const followers = await this.userRepository
                .createQueryBuilder("user")
                .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
                .getMany();
            const cacheTasks = followers.map(async (follower) => {
                await this.redisService.delete(`notifications:${follower.id}`);
                await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            });
            await Promise.all(cacheTasks);
            await this.jobRepository.remove(job);
            return { message: "Delete job success" };
        }
        ;
        throw new common_1.ForbiddenException("Can't delete this job");
    }
    async addToFavorites(currentUserId, jobId) {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ["favorites"]
        });
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        if (!job)
            throw new common_1.NotFoundException("Job not found");
        if (!user.favorites.find((fav) => fav.id === job.id)) {
            user.favorites.push(job);
            return this.userRepository.save(user);
        }
        return user;
    }
    async removeFromFavorite(currentUserId, jobId) {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ["favorites"]
        });
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        if (!job)
            throw new common_1.NotFoundException("Job not found");
        user.favorites = user.favorites.filter((job) => job.id !== jobId);
        return this.userRepository.save(user);
    }
    async getFavorites(currentUserId) {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ["favorites"]
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user.favorites;
    }
    async getFavoritesJobProfile(currentUserId) {
        const user = await this.userRepository.findOne({ where: { id: currentUserId } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const favorites = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.favorites', 'favorite')
            .where('user.id = :id', { id: currentUserId })
            .select(['favorite.id'])
            .getRawMany();
        return favorites;
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        notification_gateway_1.NotificationsGateway,
        notification_service_1.NotificationService,
        redis_service_1.RedisService])
], JobService);
;
//# sourceMappingURL=job.service.js.map