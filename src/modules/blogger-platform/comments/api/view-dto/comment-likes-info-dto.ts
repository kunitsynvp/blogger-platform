import { LikeStatus } from '../../domain/enums/like-status-enum';

export class CommentLikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus = LikeStatus.None;
}