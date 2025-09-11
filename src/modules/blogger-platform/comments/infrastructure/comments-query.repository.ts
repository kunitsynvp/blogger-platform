import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../domain/comment.entity';
import { CommentsViewDto } from '../api/view-dto/comments-view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsQueryDto } from '../api/input-dto/comments-query-dto';
import mongoose, { FilterQuery } from 'mongoose';
import type { CommentModelType } from '../domain/comment.entity';


@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModelType) {}
  async findByIdOrFail(commentId: string): Promise<CommentsViewDto>{
    const foundComment =  await this.commentModel.findById(commentId)
    if (!foundComment) {
      throw new NotFoundException(`Comment not found`);
    }
    return CommentsViewDto.mapToView(foundComment)
  }
  async findAllComments(query: CommentsQueryDto, postId?: string): Promise<PaginatedViewDto<CommentsViewDto[]>>{
    const filter: FilterQuery<Comment> = {}
    if (postId){
      filter.postId = new mongoose.Types.ObjectId(postId);
    }
    
    const comments = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)

    const totalCount = await this.commentModel.countDocuments(filter)

    const items = comments.map(CommentsViewDto.mapToView);

    return PaginatedViewDto.mapToView(
      {
        page: query.pageNumber,
        size: query.pageSize,
        totalCount: totalCount,
        items: items,
      })
  }
}