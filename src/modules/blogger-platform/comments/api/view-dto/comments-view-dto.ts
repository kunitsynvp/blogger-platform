import { LikeStatus } from '../../domain/enums/like-status-enum';
import { CommentCompoundDbType } from '../../domain/comment.entity';

export class CommentsViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  static mapToView(comment: CommentCompoundDbType): CommentsViewDto {
    const dto = new CommentsViewDto();
    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = {
      likesCount: +comment.likesCount,
      dislikesCount: +comment.dislikesCount,
      myStatus: comment.myStatus,
    };
    return dto;
  }
}