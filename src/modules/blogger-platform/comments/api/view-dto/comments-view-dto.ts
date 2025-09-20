import { LikeStatus } from '../../domain/enums/like-status-enum';
import { CommentDocument } from '../../domain/comment.entity';
import { CommentLikesInfoDto } from './comment-likes-info-dto';

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
  static mapToView(comment: CommentDocument, mappingDto: CommentLikesInfoDto): CommentsViewDto {
    const dto = new CommentsViewDto();
    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = {
      likesCount: mappingDto.likesCount,
      dislikesCount: mappingDto.dislikesCount,
      myStatus: mappingDto.myStatus,
    };
    return dto;
  }
}