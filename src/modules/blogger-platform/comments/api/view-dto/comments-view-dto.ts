import { LikeStatus } from '../../domain/enums/like-status-enum';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentsViewDto {
  id: string
  content: string
  commentatorInfo: {
    userId : string
    userLogin: string
  }
  createdAt: string
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
  }
  static mapToView(comment: CommentDocument): CommentsViewDto {
    const dto = new CommentsViewDto();
    dto.id = comment._id.toString();
    dto.content = comment.content
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin,
    }
    dto.createdAt = comment.createdAt.toISOString()
    dto.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None
    }
    return dto
  }

}