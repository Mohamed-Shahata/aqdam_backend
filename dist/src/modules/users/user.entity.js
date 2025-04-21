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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const enum_roles_1 = require("../../utils/enum.roles");
const typeorm_1 = require("typeorm");
const job_entity_1 = require("../jobs/job.entity");
const post_entity_1 = require("../posts/post.entity");
const likes_entity_1 = require("../posts/likes.entity");
let User = class User {
    id;
    firstName;
    lastName;
    age;
    email;
    password;
    role;
    bio;
    profileImage;
    imagePublicId;
    isAccountVerify;
    verificationCode;
    point;
    following;
    followers;
    job;
    posts;
    favorites;
    reaction;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], User.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: "250", unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enum_roles_1.UserRole, default: enum_roles_1.UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "imagePublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAccountVerify", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "verificationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User, user => user.followers),
    (0, typeorm_1.JoinTable)({
        name: "user_followers",
        joinColumn: {
            name: "follower_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "following_id",
            referencedColumnName: "id"
        }
    }),
    __metadata("design:type", Array)
], User.prototype, "following", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User, user => user.following),
    __metadata("design:type", Array)
], User.prototype, "followers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, (job) => job.user),
    __metadata("design:type", Array)
], User.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_entity_1.Post, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => job_entity_1.Job, (job) => job.favoriteBy),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => likes_entity_1.Reaction, (reaction) => reaction.user),
    __metadata("design:type", Array)
], User.prototype, "reaction", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
;
//# sourceMappingURL=user.entity.js.map