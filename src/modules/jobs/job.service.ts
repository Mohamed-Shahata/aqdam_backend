import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { In, Repository } from "typeorm";
import { CreateJobDto } from "./dto/create-job.dto";
import { UserService } from "../users/user.service";
import { JWTPayload } from "src/utils/type";
import { UpdateJobDto } from "./dto/update-job.dto";
import { UserRole } from "src/utils/enum.roles";
import { User } from "../users/user.entity";
import { Notification } from "../notifications/notification.entity";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { NotificationService } from "../notifications/notification.service";
import { RedisService } from "../redis/redis.service";



@Injectable()
export class JobService {

  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService
  ) { };

  public getAll() {
    return this.jobRepository.find({ order: { createdAt: "DESC" } });
  };

  // public async getAllFollowing(currentUserId: number) {
  //   const user = await this.userRepository.findOne({
  //     where: { id: currentUserId },
  //     relations: ["following"]
  //   });

  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }

  //   const cacheKey = `user_feed_${user.id}`;
  //   const cachePostUser = await this.redisService.get(cacheKey);
  //   if (cachePostUser) {
  //     try {
  //       const parsed = JSON.parse(cachePostUser);
  //       return Array.isArray(parsed) ? parsed : [];
  //     } catch (error) {
  //       console.error('Redis cache parse error:', error);
  //       console.log('Raw cache data:', cachePostUser);
  //     }
  //   }

  //   const followingIds = user.following.map(f => f.id);
  //   if (!followingIds.length) return [];

  //   const jobs = await this.jobRepository.find({
  //     where: { user: In(followingIds) },
  //     order: { createdAt: "DESC" },
  //     relations: ["user"]
  //   });

  //   try {
  //     await this.redisService.set(`user_feed_${user.id}`, JSON.stringify(jobs), 300);
  //     console.log("Cache set successfully");
  //   } catch (error) {
  //     console.error("Error setting cache:", error);
  //   }

  //   return jobs;
  // }

  public async getAllForUserId(id: number, page: number = 1, limit: number = 5) {
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

      // cacheing
      const followers = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
        .getMany()

      const cacheTasks = followers.map(async (follower) => {
        await this.redisService.delete(`notifications:${follower.id}`);
        await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
      });

      await Promise.all(cacheTasks);
      return this.getOne(job.id);

    };
    throw new ForbiddenException("Can't update this job");
  }

  public async delete(payload: JWTPayload, jobId: number): Promise<{ message: string }> {
    const user = await this.userService.getOne(payload.id);
    const job = await this.getOne(jobId);

    if (job.user.id === user.id || user.role === UserRole.ADMIN) {

      // cacheing
      const followers = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
        .getMany()

      const cacheTasks = followers.map(async (follower) => {
        await this.redisService.delete(`notifications:${follower.id}`);
        await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
      });

      await Promise.all(cacheTasks);

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

  public async getFavoritesJobProfile(currentUserId: number) {
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) throw new NotFoundException("User not found");

    const favorites = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.favorites', 'favorite')
      .where('user.id = :id', { id: currentUserId })
      .select(['favorite.id'])
      .getRawMany();

    return favorites;
  }

};