import { IsNotEmpty, IsNumber, IsString, Length, Max, MaxLength, Min, MinLength } from "class-validator"
import { GenderType } from "src/utils/enum.roles"

export class RegisterDto {

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  firstName: string

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  lastName: string

  @IsNumber()
  @IsNotEmpty()
  @Min(12)
  @Max(100)
  age: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  email: string

  @IsString()
  @IsNotEmpty()
  gender: GenderType

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string
}