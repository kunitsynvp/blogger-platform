import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../domain/comments-like-entity';
import type { CommentModelType } from '../../comments/domain/comment.entity';
import mongoose from 'mongoose';
import { GetCommentLikesInfoDto } from './dto/get-like-status-dto';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectModel(CommentLike.name) private commentLikeModel: CommentModelType,
  ) {}
  async save(commentLike: CommentLikeDocument): Promise<CommentLikeDocument> {
    return await commentLike.save();
  }
  async getLikeStatus(
    dto: GetCommentLikesInfoDto,
  ): Promise<CommentLikeDocument | null> {
    return this.commentLikeModel.findOne({
      commentId: new mongoose.Types.ObjectId(dto.commentId),
      userId: new mongoose.Types.ObjectId(dto.userId),
    });
  }
}