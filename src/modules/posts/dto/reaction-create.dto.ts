import { IsString } from "class-validator";
import { ReactionType } from "src/utils/enum.roles";


export class CreateReactiontDto {
  @IsString()
  type: ReactionType
}