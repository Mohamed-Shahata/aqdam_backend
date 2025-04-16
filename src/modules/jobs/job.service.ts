import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { Repository } from "typeorm";
import { CreateJobDto } from "./dto/create-job.dto";
import { UserService } from "../users/user.service";
import { JWTPayload } from "src/utils/type";
import { UpdateJobDto } from "./dto/update-job.dto";
import { UserRole } from "src/utils/enum.roles";



@Injectable()
export class JobService {

  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    private readonly userService: UserService
  ) { };

  public getAll() {
    return this.jobRepository.find({ order: { createdAt: "DESC" } });
  };

  public async getAllForUserId(id: number) {
    const user = await this.userService.getOne(id);
    return await this.jobRepository.find({ where: { user } });
  };

  public async getOne(id: number) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new BadRequestException("Job not found");
    return job;
  }

  public async create(userId: number, dto: CreateJobDto): Promise<Job> {
    const { title, short_intro, responsibilities, requirements, extra_info, email_applay } = dto;

    const user = await this.userService.getOne(userId);
    const newJob = this.jobRepository.create({
      title,
      short_intro,
      responsibilities,
      requirements,
      extra_info,
      email_applay,
      user
    });

    return await this.jobRepository.save(newJob);
  };

  public async update(payload: JWTPayload, jobId: number, dto: UpdateJobDto) {
    const { title, short_intro, responsibilities, requirements, extra_info, email_applay } = dto;
    const user = await this.userService.getOne(payload.id);
    const job = await this.getOne(jobId);

    if (job.user.id === user.id || user.role === UserRole.ADMIN) {
      await this.jobRepository.update(job.id,
        {
          title,
          short_intro,
          responsibilities,
          requirements,
          extra_info,
          email_applay
        });
      return this.getOne(job.id);

    };
    throw new ForbiddenException("Can't update this job");
  }

  public async delete(payload: JWTPayload, jobId: number): Promise<{ message: string }> {
    const user = await this.userService.getOne(payload.id);
    const job = await this.getOne(jobId);

    if (job.user.id === user.id || user.role === UserRole.ADMIN) {
      await this.jobRepository.remove(job);
      return { message: "Delete job success" };
    };
    throw new ForbiddenException("Can't delete this job");
  }



  // private async checkAccessUserForJob(payload: JWTPayload, jobId: number) {
  //   const user = await this.userService.getOne(payload.id);
  //   const job = await this.getOne(jobId);

  //   if (job.user !== user || user.role !== UserRole.ADMIN) {
  //     return false;
  //   };
  //   return job;
  // }
};