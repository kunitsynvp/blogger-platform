import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreateCommentLikeStatusDto {
  commentId: string;
  userId: string
  likeStatus: LikeStatus;
}