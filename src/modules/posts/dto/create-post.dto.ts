import { IsOptional, IsString, MinLength } from "class-validator";


export class CreatePostDto {

  @IsString()
  @MinLength(2)
  title: string

  @IsString()
  @MinLength(2)
  introduction: string

  @IsString()
  @MinLength(2)
  objectives_learn: string

  @IsString()
  @MinLength(2)
  content: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  use_cases?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  additional_tips?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  resources?: string
}