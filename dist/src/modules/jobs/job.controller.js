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
exports.JobController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/guards/auth.guard");
const job_service_1 = require("./job.service");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_job_dto_1 = require("./dto/create-job.dto");
const update_job_dto_1 = require("./dto/update-job.dto");
let JobController = class JobController {
    jobService;
    constructor(jobService) {
        this.jobService = jobService;
    }
    ;
    getAllJobs() {
        return this.jobService.getAll();
    }
    getAllJobsWithMe(userId) {
        return this.jobService.getAllForUserId(userId);
    }
    getOneJob(id) {
        return this.jobService.getOne(id);
    }
    createJob(payload, dto) {
        return this.jobService.create(payload.id, dto);
    }
    updateJob(payload, id, dto) {
        return this.jobService.update(payload, id, dto);
    }
    deleteJob(payload, id) {
        return this.jobService.delete(payload, id);
    }
    addJobToFavorites(payload, jobId) {
        return this.jobService.addToFavorites(payload.id, jobId);
    }
    deleteJobFromFavorites(payload, jobId) {
        return this.jobService.removeFromFavorite(payload.id, +jobId);
    }
    getUserFavorite(payload) {
        return this.jobService.getFavorites(payload.id);
    }
};
exports.JobController = JobController;
__decorate([
    (0, common_1.Get)(""),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getAllJobs", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getAllJobsWithMe", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getOneJob", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_job_dto_1.CreateJobDto]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "createJob", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_job_dto_1.UpdateJobDto]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "deleteJob", null);
__decorate([
    (0, common_1.Post)("favorites"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)("jobId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "addJobToFavorites", null);
__decorate([
    (0, common_1.Delete)("favorites/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "deleteJobFromFavorites", null);
__decorate([
    (0, common_1.Post)("favorites/me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getUserFavorite", null);
exports.JobController = JobController = __decorate([
    (0, common_1.Controller)("jobs"),
    __metadata("design:paramtypes", [job_service_1.JobService])
], JobController);
;
//# sourceMappingURL=job.controller.js.map