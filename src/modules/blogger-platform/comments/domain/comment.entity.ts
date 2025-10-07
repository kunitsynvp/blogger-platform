import {
  CheckExceptionsCommentDomainDto,
  CreateCommentDomainDto,
  UpdateCommentDomainDto,
} from './dto/comment-domain-dtos';
import { commentConstraints } from './constraints/comment-constraints';
import { LikeStatus } from './enums/like-status-enum';

export class Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt: Date;

  static createComment(dto: CreateCommentDomainDto): Comment {
    const newComment = new Comment();
    const excDto = new CheckExceptionsCommentDomainDto();
    excDto.content = dto.content;
    newComment.checkCommentsExceptions(excDto);

    newComment.content = dto.content;
    newComment.userId = dto.userId;
    newComment.postId = dto.postId;
    newComment.createdAt = new Date()

    return newComment;
  }
  updateComment(dto: UpdateCommentDomainDto): void {
    const checkExcDto = new CheckExceptionsCommentDomainDto();
    checkExcDto.content = dto.content;

    this.checkCommentsExceptions(checkExcDto);
    this.content = dto.content;
  }
  checkCommentsExceptions(dto: CheckExceptionsCommentDomainDto) {
    if (
      dto.content.length < commentConstraints.minContentLength ||
      dto.content.length > commentConstraints.maxContentLength
    ) {
      throw new Error('invalid comment content');
    }
  }
}
export type CommentDbType = {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt: Date;
}
export type CommentCompoundDbType = {
  id: number;
  content: string;
  userId: number;
  userLogin: string;
  createdAt: Date;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatus;
}