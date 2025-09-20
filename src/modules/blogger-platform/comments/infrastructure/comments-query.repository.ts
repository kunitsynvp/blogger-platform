import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../domain/comment.entity';
import { Comment } from '../domain/comment.entity';
import { CommentsViewDto } from '../api/view-dto/comments-view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsQueryDto } from '../api/input-dto/comments-query-dto';
import mongoose, { FilterQuery } from 'mongoose';
import { CommentLikeQueryRepository } from '../../comments-likes/infrastructure/comment-like-query-repository';
import { CommentLikesInfoDto } from '../api/view-dto/comment-likes-info-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    private commentLikesQueryRepository: CommentLikeQueryRepository,
  ) {}
  async findByIdOrFail(
    commentId: string,
    userId?: string,
  ): Promise<CommentsViewDto> {
    const foundComment = await this.commentModel.findById(commentId);
    if (!foundComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }

    const likesInfo: CommentLikesInfoDto =
      await this.commentLikesQueryRepository.getMyLikesInfo({
        commentId: commentId,
        userId: userId,
      });
    return CommentsViewDto.mapToView(foundComment, likesInfo);
  }
  async findAllComments(
    query: CommentsQueryDto,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const filter: FilterQuery<Comment> = {};
    if (postId) {
      filter.postId = new mongoose.Types.ObjectId(postId);
    }

    const comments = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.commentModel.countDocuments(filter);

    const items = [] as CommentsViewDto[];

    for (const comment of comments) {
      const likeInfo = await this.commentLikesQueryRepository.getMyLikesInfo({
        commentId: comment._id.toString(),
        userId: userId,
      });
      items.push(CommentsViewDto.mapToView(comment, likeInfo));
    }

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
}