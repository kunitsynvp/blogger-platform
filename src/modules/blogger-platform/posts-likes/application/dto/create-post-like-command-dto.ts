import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class CreatePostLikeCommandDto {
  postId: number
  userId: number
  likeStatus: LikeStatus
  private constructor(postId: number, userId:number, likeStatus: LikeStatus) {
    this.postId = postId;
    this.userId = userId;
    this.likeStatus = likeStatus;
  }
  static createDto(postId: number, userId: number, likeStatus: LikeStatus) {
    return new CreatePostLikeCommandDto(postId, userId, likeStatus);
  }
}