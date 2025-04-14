import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { UpdateUserDto } from "./dto/user-update.dto";
import { CloudinaryService } from "../uploads/cloudinary.service";
import { ImageType, JWTPayload } from "src/utils/type";
import { UserRole } from "src/utils/enum.roles";


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService
  ) { };

  /**
   * 
   * @returns 
   */
  public getAll() {
    return this.userRepository.find();
  };


  /**
   * 
   * @param id 
   * @returns 
   */
  public async getOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException("User not found");

    return user;
  };


  /**
   * 
   * @param id 
   * @param dto 
   * @returns 
   */
  public async update(payload: JWTPayload, dto: UpdateUserDto) {
    const { firstName, lastName, age, bio } = dto;
    const user = await this.getOne(payload.id);

    await this.userRepository.update(payload.id, { firstName, lastName, age, bio });

    return await this.getOne(user.id);
  };

  /**
   * 
   * @param id 
   * @returns 
   */
  public async delete(payload: JWTPayload) {
    const user = await this.getOne(payload.id);

    if (user.id === payload.id || payload.role === UserRole.ADMIN) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
      await this.userRepository.remove(user);
      return { message: "Delete user success" };
    }

    throw new ForbiddenException("access denaid, you are not allowed")
  };


  /**
   * 
   * @param id 
   * @param file 
   * @returns 
   */
  public async uploadImage(payload: JWTPayload, file: Express.Multer.File) {
    const user = await this.getOne(payload.id);

    if (user.profileImage !== null) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
    };

    const result = await this.cloudinaryService.uploadImage(file);
    user.profileImage = result.secure_url;
    user.imagePublicId = result.public_id;
    return await this.userRepository.save(user);
  }


  /**
   * 
   * @param id 
   * @returns 
   */
  public async deleteImage(payload: JWTPayload) {
    const user = await this.getOne(payload.id);

    if (user.profileImage !== null) {
      await this.cloudinaryService.deleteImage(user.imagePublicId!);
      user.imagePublicId = null;
      user.profileImage = null;
    } else {
      throw new BadRequestException("image not found");
    }
    return await this.userRepository.save(user);
  }
};