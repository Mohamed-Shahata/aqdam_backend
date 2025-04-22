import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
  public getAllUsers(
    @Query("search") search: string,
  ) {
    return this.userService.getAll(search);
  };

  @Get("people")
  @UseGuards(AuthGuard)
  public getAllPeople(
    @Query("search") search: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    return this.userService.getAllPeople(search, pageNumber, limitNumber);
  };

  // GET: ~/api/users/:id
  @Get(":id")
  @UseGuards(AuthGuard)
  public getOneUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getOne(id);
  };

  // GET: ~/api/users/user/:id
  @Get("user/:id")
  @UseGuards(AuthGuard)
  public getOneUserCache(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getOneUserCache(id);
  };

  // GET: ~/api/users/:id
  @Post("me")
  @UseGuards(AuthGuard)
  public getmeUser(@CurrentUser() Payload: JWTPayload) {
    return this.userService.getMe(Number(Payload.id));
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

  // POST: ~/api/users/images/upload-image
  @Post("images/upload-image")
  @UseInterceptors(FileInterceptor("user-image"))
  @UseGuards(AuthGuard)
  public async uploadImageUser(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayload
  ) {
    console.log("test")
    if (!file) throw new BadRequestException("no image provided")
    return this.userService.uploadImage(payload, file);
  }

  // DELETE: ~/api/users/images/delete-image
  @Delete("images/delete-image")
  @UseGuards(AuthGuard)
  public deleteImage(
    @CurrentUser() payload: JWTPayload
  ) {
    console.log("delete")
    return this.userService.deleteImage(payload);
  };

  // POST: ~/api/users/follow/:targetId
  @UseGuards(AuthGuard)
  @Post("follow/:id")
  public toggleFollowUser(@Param("id", ParseIntPipe) targetId: number, @CurrentUser() payload: JWTPayload) {
    return this.userService.toggleFollow(payload.id, targetId);
  }

  // POST: ~/api/users/following
  @UseGuards(AuthGuard)
  @Post(":id/following")
  public getFollowingUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getFollowing(id);
  }

  // GET: ~/api/users/following/me
  @UseGuards(AuthGuard)
  @Get("following/me")
  public getFollowingUserMe(@CurrentUser() payload: JWTPayload) {
    return this.userService.getFollowingMe(payload.id);
  }
  // POST: ~/api/users/followers
  @UseGuards(AuthGuard)
  @Post(":id/followers")
  public getFollowersUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getFollowers(id);
  }
};