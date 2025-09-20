import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/posts-like-entity';
import type { PostModelType } from '../../posts/domain/post.entity';
import { GetPostLikeStatusDto } from './dto/get-post-like-status-dto';


@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: PostModelType,
  ) {}
  async save(commentLike: PostLikeDocument): Promise<PostLikeDocument> {
    return await commentLike.save();
  }
  async getLikeStatus(
    dto: GetPostLikeStatusDto,
  ): Promise<PostLikeDocument | null> {
    return this.postLikeModel.findOne({
      postId: new mongoose.Types.ObjectId(dto.postId),
      userId: new mongoose.Types.ObjectId(dto.userId),
    });
  }
}