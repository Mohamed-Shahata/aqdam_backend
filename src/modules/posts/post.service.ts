import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./post.entity";
import { In, Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UserService } from "../users/user.service";
import { User } from "../users/user.entity";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { NotificationService } from "../notifications/notification.service";
import { Notification } from "../notifications/notification.entity";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ReactionType, UserRole } from "src/utils/enum.roles";
import { JWTPayload } from "src/utils/type";
import { Reaction } from "./likes.entity";
import { RedisService } from "../redis/redis.service";
import { Job } from "../jobs/job.entity";


@Injectable()
export class PostService {


  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Reaction) private readonly reactionRepository: Repository<Reaction>,
    private readonly userService: UserService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService
  ) { };

  public async create(userId: number, dto: CreatePostDto) {
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
      .innerJoin(
        "user_followers",
        "uf",
        "uf.follower_id = user.id AND uf.following_id = :userId",
        { userId: user.id }
      )
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


  public async getAllPostsAndJobsFollowing(userId: number, page: number = 1, limit: number = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["following"],
    });
    if (!user) throw new NotFoundException("User not found");

    const cacheKey = `user_feed_${user.id}_page_${page}_limit_${limit}`;
    const cachePostUser = await this.redisService.get(cacheKey);

    if (cachePostUser) {
      try {
        const parsed = JSON.parse(cachePostUser);
        if (parsed && parsed.data) {
          return parsed;
        }
      } catch (error) {
        console.error("Redis cache parse error:", error);
      }
    }

    const followingIds = user.following.map((f) => f.id);

    // Combine posts and jobs query into one with `Promise.all`
    const [postsPromise, jobsPromise] = [
      this.postRepository.findAndCount({
        where: { user: In(followingIds) },
        order: { createdAt: "DESC" },
        relations: ["user"],
      }),
      this.jobRepository.findAndCount({
        where: { user: In(followingIds) },
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

    await this.redisService.set(cacheKey, JSON.stringify(response), 60); // Can adjust TTL based on use case
    return response;
  }

  // public async getAllFollowing(userId: number) {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ["following"]
  //   });

  //   if (!user)
  //     throw new NotFoundException("User not found");

  //   const cacheKey = `user_feed_${user.id}`;
  //   const cachePostUser = await this.redisService.get(cacheKey);
  //   if (cachePostUser) {
  //     try {
  //       const parsed = JSON.parse(cachePostUser);
  //       return Array.isArray(parsed) ? parsed : [];
  //     } catch (error) {
  //       console.error('Redis cache parse error:', error);
  //     }
  //   }

  //   const followingIds = user.following.map(f => f.id);

  //   const posts = await this.postRepository.find({
  //     where: { user: In(followingIds) },
  //     order: { createdAt: "DESC" },
  //     relations: ["user"]
  //   });

  //   await this.redisService.set(cacheKey, JSON.stringify(posts), 300);
  //   return posts;
  // };

  public async getAllForUserId(currentUserId: number, page: number = 1, limit: number = 5) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 5;

    const user = await this.userService.getOne(currentUserId);

    const [posts, total] = await this.postRepository
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
        'user.gender',
        'user.profileImage'
      ])
      .skip((pageNumber - 1) * limitNumber)
      .take(limitNumber)
      .getManyAndCount();

    return {
      data: posts,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalItems: total
    };
  }


  public async getOne(postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post not found")
    return post
  };


  public async update(payload: JWTPayload, postId: number, dto: UpdatePostDto) {
    const { title, content, resources } = dto;

    const user = await this.userService.getOne(payload.id);
    const post = await this.getOne(postId);

    if (post.user.id === user.id || user.role === UserRole.ADMIN) {
      await this.postRepository.update(postId,
        {
          title, content, resources
        });

      // cacheing
      const followers = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
        .getMany()

      for (const follower of followers) {
        await this.redisService.delete(`notifications:${follower.id}`);
        await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
      }

      return this.getOne(post.id);

    };
    throw new ForbiddenException("Can't update this post");
  }

  public async delete(payload: JWTPayload, postId: number): Promise<{ message: string }> {
    const user = await this.userService.getOne(payload.id);
    const post = await this.getOne(postId);

    if (post.user.id === user.id || user.role === UserRole.ADMIN) {

      // cacheing
      const followers = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
        .getMany()

      for (const follower of followers) {
        await this.redisService.delete(`notifications:${follower.id}`);
        await this.redisService.deleteByPattern(`user_feed_${follower.id}*`);
      }


      await this.postRepository.remove(post);
      user.point -= 6;
      await this.userRepository.save(user);
      return { message: "Delete post success" };
    };
    throw new ForbiddenException("Can't delete this post");
  }


  public async reactionToPost(currentUserId: number, postId: number, type: ReactionType) {
    const user = await this.userService.getOne(currentUserId);
    const post = await this.getOne(postId);

    const existingReaction = await this.reactionRepository.findOne({
      where: { user: { id: user.id }, post: { id: post.id } }
    })

    if (existingReaction) {
      existingReaction.type = type;
      return this.reactionRepository.save(existingReaction)
    }

    const reaction = this.reactionRepository.create({
      user: { id: user.id },
      post: { id: post.id },
      type
    });
    return this.reactionRepository.save(reaction);
  }

  public async removeReactionFromPost(currentUserId: number, postId: number) {
    const user = await this.userService.getOne(currentUserId);
    const post = await this.getOne(postId);

    const reaction = await this.reactionRepository.findOne({
      where: { user: { id: user.id }, post: { id: post.id } }
    })

    if (!reaction)
      throw new NotFoundException("Reaction not found")

    return this.reactionRepository.remove(reaction);
  }

  public async getReactionFromPost(postId: number) {
    const post = await this.getOne(postId);

    const reactions = await this.reactionRepository.find({
      where: { post: { id: post.id } }
    })

    const lengthObject = {
      benefited: 0,
      not_benefited: 0
    }

    for (const reaction of reactions) {
      reaction.type === ReactionType.BENEFITED ? lengthObject.benefited++ : lengthObject.not_benefited++
    }

    return lengthObject;
  }

  public async getReactionCurrentUser(userId: number) {
    const user = await this.userService.getOne(userId);

    const reactions = await this.reactionRepository.find({
      where: { user: { id: user.id } }
    })

    const array: any[] = [];

    for (let i = 0; i < reactions.length; i++) {
      array.push({
        postId: reactions[i].post.id,
        type: reactions[i].type
      });
    }

    return array;
  }
};