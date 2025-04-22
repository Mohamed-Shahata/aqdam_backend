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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const post_service_1 = require("./post.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const enum_roles_1 = require("../../utils/enum.roles");
let PostController = class PostController {
    postService;
    constructor(postService) {
        this.postService = postService;
    }
    ;
    async getAllFeeds(payload, page, limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        return this.postService.getAllPostsAndJobsFollowing(payload.id, pageNumber, limitNumber);
    }
    getAllPostsWithMe(userId, page, limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        return this.postService.getAllForUserId(userId, pageNumber, limitNumber);
    }
    getOnePost(id) {
        return this.postService.getOne(id);
    }
    createPost(payload, dto) {
        return this.postService.create(payload.id, dto);
    }
    updatePost(payload, id, dto) {
        return this.postService.update(payload, id, dto);
    }
    deletePost(payload, id) {
        return this.postService.delete(payload, id);
    }
    reaction(payload, id, type) {
        return this.postService.reactionToPost(payload.id, id, type);
    }
    removeReaction(payload, id) {
        return this.postService.removeReactionFromPost(payload.id, id);
    }
    getReaction(id) {
        return this.postService.getReactionFromPost(id);
    }
    getReactionMe(payload) {
        return this.postService.getReactionCurrentUser(payload.id);
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Get)('feeds'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getAllFeeds", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "getAllPostsWithMe", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "getOnePost", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Post)(":id/reaction"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "reaction", null);
__decorate([
    (0, common_1.Delete)(":id/reaction"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "removeReaction", null);
__decorate([
    (0, common_1.Get)(":id/reactions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "getReaction", null);
__decorate([
    (0, common_1.Get)("reactions/me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "getReactionMe", null);
exports.PostController = PostController = __decorate([
    (0, common_1.Controller)("posts"),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
;
//# sourceMappingURL=post.controller.js.map