import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreatePostLikeCommandDto {
  postId: string
  userId: string
  likeStatus: LikeStatus
  private constructor(postId: string, userId: string, likeStatus: LikeStatus) {
    this.postId = postId;
    this.userId = userId;
    this.likeStatus = likeStatus;
  }
  static createDto(postId: string, userId: string, likeStatus: LikeStatus) {
    return new CreatePostLikeCommandDto(postId, userId, likeStatus);
  }
}