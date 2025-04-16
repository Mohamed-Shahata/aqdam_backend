import { IsOptional, IsString, Length, MinLength } from "class-validator";


export class UpdateJobDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  short_intro?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  responsibilities?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  requirements?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  extra_info?: string;

  @IsString()
  @Length(2, 250)
  @IsOptional()
  email_applay?: string;
}