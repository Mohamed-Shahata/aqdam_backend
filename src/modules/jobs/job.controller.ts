import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guard";
import { JobService } from "./job.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JWTPayload } from "src/utils/type";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";


@Controller("jobs")
export class JobController {

  constructor(private readonly jobService: JobService) { };

  // GET: ~/api/jobs
  @Get("")
  @UseGuards(AuthGuard)
  public getAllJobs() {
    return this.jobService.getAll();
  }

  // GET: ~/api/jobs
  @Get("following")
  @UseGuards(AuthGuard)
  public getAllJobsFollowing(@CurrentUser() payload: JWTPayload) {
    return this.jobService.getAllFollowing(payload.id);
  }

  // GET: ~/api/jobs
  @Get("user/:userId")
  @UseGuards(AuthGuard)
  public getAllJobsWithMe(@Param("userId") userId: number) {
    return this.jobService.getAllForUserId(userId);
  }

  // GET: ~/api/jobs/:id
  @Get(":id")
  @UseGuards(AuthGuard)
  public getOneJob(@Param("id", ParseIntPipe) id: number) {
    return this.jobService.getOne(id);
  }

  // POST: ~/api/jobs
  @Post("")
  @UseGuards(AuthGuard)
  public createJob(@CurrentUser() payload: JWTPayload, @Body() dto: CreateJobDto) {
    return this.jobService.create(payload.id, dto);
  }

  // PATCH: ~/api/jobs/:id
  @Patch(":id")
  @UseGuards(AuthGuard)
  public updateJob(
    @CurrentUser() payload: JWTPayload,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto
  ) {
    return this.jobService.update(payload, id, dto);
  }

  // DELETE: ~/api/jobs/:id
  @Delete(":id")
  @UseGuards(AuthGuard)
  public deleteJob(@CurrentUser() payload: JWTPayload, @Param("id", ParseIntPipe) id: number) {
    return this.jobService.delete(payload, id);
  }

  @Post("favorites")
  @UseGuards(AuthGuard)
  public addJobToFavorites(@CurrentUser() payload: JWTPayload, @Body("jobId", ParseIntPipe) jobId: number) {
    return this.jobService.addToFavorites(payload.id, jobId);
  }

  @Delete("favorites/:id")
  @UseGuards(AuthGuard)
  public deleteJobFromFavorites(@CurrentUser() payload: JWTPayload, @Param("id", ParseIntPipe) jobId: number) {
    return this.jobService.removeFromFavorite(payload.id, +jobId);
  }

  @Post("favorites/me")
  @UseGuards(AuthGuard)
  public getUserFavorite(@CurrentUser() payload: JWTPayload) {
    return this.jobService.getFavorites(payload.id);
  }
};