import { IsNotEmpty, IsString, Length, MaxLength } from "class-validator"

export class VerifyCodeDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(6)
  code: string
}