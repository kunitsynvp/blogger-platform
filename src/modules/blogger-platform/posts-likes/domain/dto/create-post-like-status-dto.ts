import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreatePostLikeStatusDto {
  postId: number;
  userId: number
  likeStatus: LikeStatus;
}