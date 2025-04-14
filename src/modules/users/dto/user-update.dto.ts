import { IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min } from "class-validator"


export class UpdateUserDto {

  @IsString()
  @IsOptional()
  @Length(2, 20)
  firstName: string

  @IsString()
  @IsOptional()
  @Length(2, 20)
  lastName: string

  @IsNumber()
  @Min(12)
  @Max(100)
  @IsOptional()
  age: number

  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio: string
}