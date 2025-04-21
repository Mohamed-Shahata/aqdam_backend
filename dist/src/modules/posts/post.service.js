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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const post_entity_1 = require("./post.entity");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../users/user.service");
const user_entity_1 = require("../users/user.entity");
const notification_gateway_1 = require("../notifications/notification.gateway");
const notification_service_1 = require("../notifications/notification.service");
const notification_entity_1 = require("../notifications/notification.entity");
const enum_roles_1 = require("../../utils/enum.roles");
const likes_entity_1 = require("./likes.entity");
const redis_service_1 = require("../redis/redis.service");
const job_entity_1 = require("../jobs/job.entity");
let PostService = class PostService {
    postRepository;
    userRepository;
    jobRepository;
    notificationRepository;
    reactionRepository;
    userService;
    notificationGateway;
    notificationService;
    redisService;
    constructor(postRepository, userRepository, jobRepository, notificationRepository, reactionRepository, userService, notificationGateway, notificationService, redisService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationRepository = notificationRepository;
        this.reactionRepository = reactionRepository;
        this.userService = userService;
        this.notificationGateway = notificationGateway;
        this.notificationService = notificationService;
        this.redisService = redisService;
    }
    ;
    async create(userId, dto) {
        const { title, content, resources } = dto;
        const user = await this.userService.getOne(userId);
        const newPost = this.postRepository.create({
            title,
            content,
            resources,
            user,
        });
        const followers = await this.userRepository
            .createQueryBuilder("user")
            .innerJoin("user_followers", "uf", "uf.follower_id = user.id AND uf.following_id = :userId", { userId: user.id })
            .getMany();
        const savedPost = await this.postRepository.save(newPost);
        const notificationTasks = followers
            .filter((follower) => follower.id !== user.id)
            .map(async (follower) => {
            await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            const notification = this.notificationRepository.create({
                message: `${user.firstName} ${user.lastName} posted a new post`,
                post: savedPost,
                recipient: follower,
                isRead: false,
            });
            const savedNotification = await this.notificationRepository.save(notification);
            await this.notificationService.cacheNotification(savedNotification);
            await this.notificationGateway.sendNotification(follower.id, {
                message: notification.message,
                post: savedPost,
            });
        });
        await Promise.all(notificationTasks);
        user.point += 6;
        await this.userRepository.save(user);
        return { message: "created post successfully" };
    }
    async getAllPostsAndJobsFollowing(userId, page = 1, limit = 10) {
        page = Math.max(1, page);
        limit = Math.max(1, limit);
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["following"],
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const cacheKey = `user_feed_${user.id}_page_${page}_limit_${limit}`;
        const cachePostUser = await this.redisService.get(cacheKey);
        if (cachePostUser) {
            try {
                const parsed = JSON.parse(cachePostUser);
                if (parsed && parsed.data) {
                    return parsed;
                }
            }
            catch (error) {
                console.error("Redis cache parse error:", error);
            }
        }
        const followingIds = user.following.map((f) => f.id);
        const [postsPromise, jobsPromise] = [
            this.postRepository.findAndCount({
                where: { user: (0, typeorm_2.In)(followingIds) },
                order: { createdAt: "DESC" },
                relations: ["user"],
            }),
            this.jobRepository.findAndCount({
                where: { user: (0, typeorm_2.In)(followingIds) },
                order: { createdAt: "DESC" },
                relations: ["user"],
            })
        ];
        const [posts, totalPosts] = await postsPromise;
        const [jobs, totalJobs] = await jobsPromise;
        const feeds = [...jobs, ...posts];
        const sortedFeeds = feeds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const startIndex = (page - 1) * limit;
        const paginatedFeeds = sortedFeeds.slice(startIndex, startIndex + limit);
        const total = totalPosts + totalJobs;
        const totalPages = Math.ceil(total / limit);
        const response = {
            data: paginatedFeeds,
            total,
            totalPages,
            currentPage: page,
            limit,
        };
        await this.redisService.set(cacheKey, JSON.stringify(response), 60);
        return response;
    }
    async getAllForUserId(currentUserId) {
        const user = await this.userService.getOne(currentUserId);
        user;
        return this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .where('post.userId = :userId', { userId: user.id })
            .orderBy('post.createdAt', 'DESC')
            .select([
            'post.id',
            'post.title',
            'post.resources',
            'post.type',
            'post.content',
            'post.createdAt',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.lastName',
            'user.profileImage'
        ])
            .getMany();
    }
    async getOne(postId) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
        return post;
    }
    ;
    async update(payload, postId, dto) {
        const { title, content, resources } = dto;
        const user = await this.userService.getOne(payload.id);
        const post = await this.getOne(postId);
        if (post.user.id === user.id || user.role === enum_roles_1.UserRole.ADMIN) {
            await this.postRepository.update(postId, {
                title, content, resources
            });
            const followers = await this.userRepository
                .createQueryBuilder("user")
                .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
                .getMany();
            for (const follower of followers) {
                await this.redisService.delete(`notifications:${follower.id}`);
                await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            }
            return this.getOne(post.id);
        }
        ;
        throw new common_1.ForbiddenException("Can't update this post");
    }
    async delete(payload, postId) {
        const user = await this.userService.getOne(payload.id);
        const post = await this.getOne(postId);
        if (post.user.id === user.id || user.role === enum_roles_1.UserRole.ADMIN) {
            const followers = await this.userRepository
                .createQueryBuilder("user")
                .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
                .getMany();
            for (const follower of followers) {
                await this.redisService.delete(`notifications:${follower.id}`);
                await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
            }
            await this.postRepository.remove(post);
            user.point -= 6;
            await this.userRepository.save(user);
            return { message: "Delete post success" };
        }
        ;
        throw new common_1.ForbiddenException("Can't delete this post");
    }
    async reactionToPost(currentUserId, postId, type) {
        const user = await this.userService.getOne(currentUserId);
        const post = await this.getOne(postId);
        const existingReaction = await this.reactionRepository.findOne({
            where: { user: { id: user.id }, post: { id: post.id } }
        });
        if (existingReaction) {
            existingReaction.type = type;
            return this.reactionRepository.save(existingReaction);
        }
        const reaction = this.reactionRepository.create({
            user: { id: user.id },
            post: { id: post.id },
            type
        });
        return this.reactionRepository.save(reaction);
    }
    async removeReactionFromPost(currentUserId, postId) {
        const user = await this.userService.getOne(currentUserId);
        const post = await this.getOne(postId);
        const reaction = await this.reactionRepository.findOne({
            where: { user: { id: user.id }, post: { id: post.id } }
        });
        if (!reaction)
            throw new common_1.NotFoundException("Reaction not found");
        return this.reactionRepository.remove(reaction);
    }
    async getReactionFromPost(postId) {
        const post = await this.getOne(postId);
        const reactions = await this.reactionRepository.find({
            where: { post: { id: post.id } }
        });
        const lengthObject = {
            benefited: 0,
            not_benefited: 0
        };
        for (const reaction of reactions) {
            reaction.type === enum_roles_1.ReactionType.BENEFITED ? lengthObject.benefited++ : lengthObject.not_benefited++;
        }
        return lengthObject;
    }
    async getReactionCurrentUser(userId) {
        const user = await this.userService.getOne(userId);
        const reactions = await this.reactionRepository.find({
            where: { user: { id: user.id } }
        });
        const array = [];
        for (let i = 0; i < reactions.length; i++) {
            array.push({
                postId: reactions[i].post.id,
                type: reactions[i].type
            });
        }
        return array;
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(4, (0, typeorm_1.InjectRepository)(likes_entity_1.Reaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        notification_gateway_1.NotificationsGateway,
        notification_service_1.NotificationService,
        redis_service_1.RedisService])
], PostService);
;
//# sourceMappingURL=post.service.js.map