import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreatePostLikeStatusDto {
  postId: string;
  userId: string
  likeStatus: LikeStatus;
  login: string;
}