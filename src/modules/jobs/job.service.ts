import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { In, Repository } from "typeorm";
import { CreateJobDto } from "./dto/create-job.dto";
import { UserService } from "../users/user.service";
import { JWTPayload } from "src/utils/type";
import { UpdateJobDto } from "./dto/update-job.dto";
import { UserRole } from "src/utils/enum.roles";
import { User } from "../users/user.entity";



@Injectable()
export class JobService {

  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService
  ) { };

  public getAll() {
    return this.jobRepository.find({ order: { createdAt: "DESC" } });
  };

  public async getAllFollowing(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["following"]
    })

    if (!user)
      throw new NotFoundException("User not found");

    const followingIds = user.following.map(f => f.id);

    if (!followingIds.length) return [];
    return this.jobRepository.find({
      where: { user: In(followingIds) },
      order: { createdAt: "DESC" },
      relations: ["user"]
    })
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

    user.point += 5;
    await this.userRepository.save(user);

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

  public async addToFavorites(currentUserId: number, jobId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favorites"]
    });

    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!user)
      throw new NotFoundException("User not found")

    if (!job)
      throw new NotFoundException("Job not found")

    if (!user.favorites.find((fav) => fav.id === job.id)) {
      user.favorites.push(job);
      return this.userRepository.save(user);
    }
    return user;
  }


  public async removeFromFavorite(currentUserId: number, jobId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favorites"]
    });

    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!user)
      throw new NotFoundException("User not found")

    if (!job)
      throw new NotFoundException("Job not found")

    user.favorites = user.favorites.filter((job) => job.id !== jobId);
    return this.userRepository.save(user);
  }

  public async getFavorites(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favorites"]
    });

    if (!user)
      throw new NotFoundException("User not found")

    return user.favorites;
  }


};