import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreateCommentLikeStatusDto } from '../application/dto/create-comment-like-status-dto';

export class CommentLike {
  id: number;
  userId: number
  commentId: number
  status: LikeStatus;
  createdAt: Date;

  static createLikeStatus(dto: CreateCommentLikeStatusDto): CommentLike {
    const newLikeStatus = new CommentLike();
    newLikeStatus.checkCommentLikeExceptions(dto.likeStatus);

    newLikeStatus.userId = dto.userId;
    newLikeStatus.commentId = dto.commentId
    newLikeStatus.status = dto.likeStatus;
    return newLikeStatus;
  }
  updateLikeStatus(newLikeStatus: LikeStatus): void {
    this.checkCommentLikeExceptions(newLikeStatus);
    this.status = newLikeStatus;
  }
  checkCommentLikeExceptions(newStatus: LikeStatus): void {
    if (!Object.values(LikeStatus).includes(newStatus)) {
      throw new Error(`invalid like status`);
    }
  }
}
export type CommentLikeDbType = {
  id: number;
  userId: number
  commentId: number
  likeStatus: LikeStatus;
  createdAt: Date;
}