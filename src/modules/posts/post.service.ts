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


@Injectable()
export class PostService {


  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Reaction) private readonly reactionRepository: Repository<Reaction>,
    private readonly userService: UserService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly notificationService: NotificationService
  ) { };

  public async create(userId: number, dto: CreatePostDto) {
    const { title, content, resources } = dto;

    const user = await this.userService.getOne(userId);

    const newPost = this.postRepository.create({
      title, content, resources, user
    });

    const followers = await this.userRepository
      .createQueryBuilder("user")
      .innerJoin("user_followers", "uf", "uf.following_id = :userId", { userId: user.id })
      .getMany()

    const savedPost = await this.postRepository.save(newPost);

    for (const follower of followers) {
      const notification = this.notificationRepository.create({
        message: `${user.firstName} ${user.lastName} posted a new post`,
        post: newPost,
        recipient: follower,
        isRead: false
      })

      const savedNotifications = await this.notificationRepository.save(notification);

      await this.notificationService.cacheNotification(savedNotifications);

      this.notificationGateway.sendNotification(follower.id, {
        message: notification.message,
        post: newPost
      })
    }

    user.point += 6;
    await this.userRepository.save(user);
    return savedPost;
  };

  public async getAllFollowing(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["following"]
    });

    if (!user)
      throw new NotFoundException("User not found");

    const followingIds = user.following.map(f => f.id);

    if (followingIds.length === 0) return [];
    return this.postRepository.find({
      where: { user: In(followingIds) },
      order: { createdAt: "DESC" },
      relations: ["user"]
    })
  };

  public async getAllForUserId(currentUserId: number) {
    const user = await this.userService.getOne(currentUserId);
    return this.postRepository.find({
      where: { user }
    })
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
      return this.getOne(post.id);

    };
    throw new ForbiddenException("Can't update this post");
  }

  public async delete(payload: JWTPayload, postId: number): Promise<{ message: string }> {
    const user = await this.userService.getOne(payload.id);
    const post = await this.getOne(postId);

    if (post.user.id === user.id || user.role === UserRole.ADMIN) {
      await this.postRepository.remove(post);
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