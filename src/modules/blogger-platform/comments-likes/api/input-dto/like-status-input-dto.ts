import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';
import { IsEnum } from 'class-validator';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}