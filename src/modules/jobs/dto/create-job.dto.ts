import { IsOptional, IsString, Length, MinLength } from "class-validator";


export class CreateJobDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  short_intro?: string;

  @IsString()
  @MinLength(2)
  responsibilities: string;

  @IsString()
  @MinLength(2)
  requirements: string;

  @IsString()
  @MinLength(2)
  extra_info: string;

  @IsString()
  @Length(2, 250)
  email_applay: string;
}