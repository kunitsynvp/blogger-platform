import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../domain/comment.entity';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import mongoose from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }
  async findByIdOrFail(commentId: string): Promise<CommentDocument> {
    const foundComment = await this.commentModel.findOne({_id: new mongoose.Types.ObjectId(commentId)})
    if(!foundComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        field: 'commentId',
      });
    }
    return foundComment
  }
  async deleteCommentOrFail(commentId: string): Promise<void> {
    const deletedComment = await this.commentModel.findById(commentId);
    if (!deletedComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
        field: 'commentId',
      });
    }
    await this.commentModel.deleteOne({_id : new mongoose.Types.ObjectId(commentId)})
  }
}