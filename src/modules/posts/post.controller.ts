import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { PostService } from "./post.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JWTPayload } from "src/utils/type";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";



@Controller("posts")
export class PostController {

  constructor(private readonly postService: PostService) { };

  // GET: ~/api/posts
  @Get("following")
  @UseGuards(AuthGuard)
  public getAllPostsFollowing(@CurrentUser() payload: JWTPayload) {
    return this.postService.getAllFollowing(payload.id);
  }

  // GET: ~/api/posts
  @Get("user/:userId")
  @UseGuards(AuthGuard)
  public getAllPostsWithMe(@Param("userId") userId: number) {
    return this.postService.getAllForUserId(userId);
  }

  // GET: ~/api/posts/:id
  @Get(":id")
  @UseGuards(AuthGuard)
  public getOnePost(@Param("id", ParseIntPipe) id: number) {
    return this.postService.getOne(id);
  }

  // POST: ~/api/posts
  @Post("")
  @UseGuards(AuthGuard)
  public createPost(@CurrentUser() payload: JWTPayload, @Body() dto: CreatePostDto) {
    return this.postService.create(payload.id, dto);
  }

  // PATCH: ~/api/posts/:id
  @Patch(":id")
  @UseGuards(AuthGuard)
  public updatePost(
    @CurrentUser() payload: JWTPayload,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto
  ) {
    console.log(id);
    return this.postService.update(payload, id, dto);
  }

  // DELETE: ~/api/jobs/:id
  @Delete(":id")
  @UseGuards(AuthGuard)
  public deletePost(@CurrentUser() payload: JWTPayload, @Param("id", ParseIntPipe) id: number) {
    return this.postService.delete(payload, id);
  }
};