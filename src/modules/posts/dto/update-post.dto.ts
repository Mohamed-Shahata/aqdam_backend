import { IsOptional, IsString, MinLength } from "class-validator";


export class UpdatePostDto {

  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  introduction?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  objectives_learn?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  content?: string;

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