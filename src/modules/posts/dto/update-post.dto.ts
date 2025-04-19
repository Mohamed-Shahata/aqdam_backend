import { IsOptional, IsString, MinLength } from "class-validator";


export class UpdatePostDto {

  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string

  @IsString()
  @MinLength(2)
  @IsOptional()
  content?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  resources?: string
}