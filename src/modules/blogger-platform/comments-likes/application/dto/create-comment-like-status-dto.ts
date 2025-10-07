import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreateCommentLikeStatusDto {
  commentId: number;
  userId: number
  likeStatus: LikeStatus;
}