import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/user-update.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Roles } from "../auth/decorators/user-role.decorator";
import { UserRole } from "src/utils/enum.roles";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JWTPayload } from "src/utils/type";


@Controller("users")
export class UserController {

  constructor(private readonly userService: UserService) { };

  // GET: ~/api/users
  @Get()
  @UseGuards(AuthGuard)
  public getAllUsers() {
    return this.userService.getAll();
  };

  // GET: ~/api/users/:id
  @Get(":id")
  @UseGuards(AuthGuard)
  public getOneUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getOne(id);
  };

  // PATCH: ~/api/users
  @Patch()
  @UseGuards(AuthGuard)
  public updateUser(@CurrentUser() payload: JWTPayload, @Body() dto: UpdateUserDto) {
    return this.userService.update(payload, dto);
  }

  // DELETE: ~/api/users
  @Delete()
  @UseGuards(AuthGuard)
  public deleteUser(@CurrentUser() payload: JWTPayload) {
    return this.userService.delete(payload);
  };

  @Post("images/upload-image")
  @UseInterceptors(FileInterceptor("user-image"))
  @Roles(UserRole.ADMIN, UserRole.SUP_USER, UserRole.USER)
  @UseGuards(AuthGuard)
  public async uploadImageUser(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayload
  ) {
    if (!file) throw new BadRequestException("no image provided")
    return this.userService.uploadImage(payload, file);
  }

  @Delete("images/delete-image")
  @Roles(UserRole.ADMIN, UserRole.SUP_USER, UserRole.USER)
  @UseGuards(AuthGuard)
  public deleteImage(
    @CurrentUser() payload: JWTPayload
  ) {
    return this.userService.deleteImage(payload);
  };
};