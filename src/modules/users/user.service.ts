import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { UpdateUserDto } from "./dto/user-update.dto";
import { CloudinaryService } from "../uploads/cloudinary.service";
import { JWTPayload } from "src/utils/type";
import { UserRole } from "src/utils/enum.roles";
import { RedisService } from "../redis/redis.service";


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisService: RedisService
  ) { };

  /**
   * Retrieves all users from the database.
   * 
   * @returns {Promise<User[]>} Array of all users.
   */
  public async getAll(search?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('LOWER(user.firstName) LIKE LOWER(:search)', { search: `%${search}%` })
        .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', { search: `%${search}%` });
    }

    return query.getMany();
  }

  async getAllPeople(
    search?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: User[]; total: number; page: number; pageSize: number; totalPages: number }> {
    page = Math.max(1, page);
    pageSize = Math.max(1, Math.min(pageSize, 100));

    const query = this.userRepository.createQueryBuilder('user');

    if (search && search.trim()) {
      query
        .where('LOWER(user.firstName) LIKE LOWER(:search)', { search: `%${search.trim()}%` })
        .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', { search: `%${search.trim()}%` });
    }

    query.orderBy('user.id', 'ASC');

    const skip = (page - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Retrieves a single user by their ID.
   * 
   * @param {number} id - The ID of the user.
   * @returns {Promise<User>} The user object.
   * @throws {NotFoundException} If the user is not found.
   */
  public async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['age', 'bio', 'firstName', 'lastName', 'id', 'point', 'profileImage', 'imagePublicId']
    });
    if (!user)
      throw new NotFoundException("User not found");
    return user;
  };

  public async getOneUserCache(id: number) {
    const cacheKey = `user_${id}`;

    try {
      const cachePostUser = await this.redisService.get(cacheKey);

      if (cachePostUser) {
        try {
          console.log(cachePostUser)
          const parsed = JSON.parse(cachePostUser);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (error) {
          console.error(`Redis cache parse error for key ${cacheKey}:`, error);
        }
      }

      const user = await this.getOne(id)
      if (!user) {
        throw new NotFoundException("User not found");
      }

      await this.redisService.set(cacheKey, JSON.stringify(user), 300);
      return { data: user };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching user with id ${id}:`, error);
      throw new InternalServerErrorException("Failed to fetch user");
    }
  }
  public async getMe(id: number): Promise<User> {
    const user = await this.getOne(id)
    if (!user)
      throw new NotFoundException("User not found");
    return user;
  };


  /**
   * Updates user information based on the payload (current user).
   * 
   * @param {JWTPayload} payload - The current user's JWT payload.
   * @param {UpdateUserDto} dto - Data transfer object containing update info.
   * @returns {Promise<User>} The updated user object.
   */
  public async update(payload: JWTPayload, dto: UpdateUserDto): Promise<User> {
    const { firstName, lastName, age, bio } = dto;
    const user = await this.getOne(payload.id);

    await this.userRepository.update(payload.id, { firstName, lastName, age, bio });
    await this.redisService.delete(`user_${user.id}`)
    return this.getOne(user.id);
  };

  /**
   * Deletes a user and their profile image if authorized.
   * 
   * @param {JWTPayload} payload - The current user's JWT payload.
   * @returns {Promise<{ message: string }>} Success message.
   * @throws {ForbiddenException} If the user is not allowed to delete.
   */
  public async delete(payload: JWTPayload): Promise<{ message: string }> {
    const user = await this.getOne(payload.id);

    if (user.id === payload.id || payload.role === UserRole.ADMIN) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
      await this.userRepository.remove(user);
      await this.redisService.delete(`user_${user.id}`)
      return { message: "Delete user success" };
    }

    throw new ForbiddenException("access denaid, you are not allowed")
  };

  /**
   * Uploads a new profile image for the user and deletes the old one if exists.
   * 
   * @param {JWTPayload} payload - The current user's JWT payload.
   * @param {Express.Multer.File} file - The image file to upload.
   * @returns {Promise<User>} The updated user with the new image.
   */
  public async uploadImage(payload: JWTPayload, file: Express.Multer.File) {
    const user = await this.getOne(payload.id);

    if (user.profileImage !== null) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
    };

    const result = await this.cloudinaryService.uploadImage(file, "users");
    user.profileImage = result.secure_url;
    user.imagePublicId = result.public_id;
    await this.redisService.delete(`user_${user.id}`)
    await this.userRepository.save(user);
    return { imageUrl: user.imagePublicId }
  }


  /**
   * Deletes the user's profile image from Cloudinary if it exists.
   * 
   * @param {JWTPayload} payload - The current user's JWT payload.
   * @returns {Promise<User>} The updated user after removing the image.
   * @throws {BadRequestException} If the user has no image to delete.
   */
  public async deleteImage(payload: JWTPayload): Promise<User> {
    const user = await this.getOne(payload.id);

    if (user.profileImage !== null) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
      user.imagePublicId = null;
      user.profileImage = null;
      await this.redisService.delete(`user_${user.id}`)
    } else {
      throw new BadRequestException("image not found");
    }
    return this.userRepository.save(user); // Notes!!
  };

  /**
   * Toggles follow/unfollow between two users.
   * 
   * @param {number} id - The ID of the current user.
   * @param {number} targetUserId - The ID of the user to follow/unfollow.
   * @returns {Promise<{ message: string }>} Follow or unfollow success message.
   * @throws {BadRequestException} If the target user does not exist.
   */
  public async toggleFollow(id: number, targetUserId: number): Promise<{ message: string }> {

    if (id === targetUserId)
      throw new BadRequestException("You cannot follow your account.")

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['following']
    });


    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId }, select: ['id'] });
    if (!targetUser) throw new BadRequestException("Target user not found");

    const isFollowing = user?.following.some(user => user.id === targetUserId);

    if (isFollowing && user) {
      user.following = user.following.filter(user => user.id !== targetUserId);
      await this.redisService.deleteByPattern(`user_feed_${user.id}*`);
      await this.redisService.delete(`user_${user.id}`)
      await this.userRepository.save(user);
      return { message: "Unfollowed successfully" };
    } else {
      user?.following.push(targetUser);
      await this.redisService.deleteByPattern(`user_feed_${user?.id}*`);
      await this.redisService.delete(`user_${user?.id}`)
      await this.userRepository.save(user!);
      return { message: "Followed successfully" };
    }
  }

  /**
   * Retrieves the list of users the current user is following.
   * 
   * @param {number} id - The ID of the user.
   * @returns {Promise<User[] | undefined>} Array of followed users.
   */
  public async getFollowing(id: number): Promise<User[] | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['following'],
      select: ['following']
    });
    return user?.following
  }

  public async getFollowingMe(id: number): Promise<User[] | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['following'],
      select: ['following']
    });
    return user?.following
  }

  /**
   * Retrieves the list of users who follow the current user.
   * 
   * @param {number} id - The ID of the user.
   * @returns {Promise<User[] | undefined>} Array of follower users.
   */
  public async getFollowers(id: number): Promise<User[] | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['followers'],
      select: ['followers']
    });
    return user?.followers
  }
};