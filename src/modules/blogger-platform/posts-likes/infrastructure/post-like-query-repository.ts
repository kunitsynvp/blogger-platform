import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import type { PostLikeModelType } from '../domain/posts-like-entity';
import { PostLike, PostLikeDocument } from '../domain/posts-like-entity';
import {
  ExtendedLikesInfo,
  LikeDetailsViewDto,
} from '../../posts/api/view-dto/posts-view-dto';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { GetPostLikeStatusDto } from './dto/get-post-like-status-dto';

@Injectable()
export class PostLikesQueryRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: PostLikeModelType,
  ) {}
  async save(commentLike: PostLikeDocument): Promise<PostLikeDocument> {
    return await commentLike.save();
  }
  async getExtendedLikesInfo(
    dto: GetPostLikeStatusDto,
  ): Promise<ExtendedLikesInfo> {
    const likesCount = await this.postLikeModel.countDocuments({
      postId: new mongoose.Types.ObjectId(dto.postId),
      status: LikeStatus.Like,
    });
    const dislikesCount = await this.postLikeModel.countDocuments({
      postId: new mongoose.Types.ObjectId(dto.postId),
      status: LikeStatus.Dislike,
    });
    const myStatus = await this.getLikeStatus(dto.postId, dto?.userId);
    const newestLikes = await this.getNewestLikes(dto.postId);

    return ExtendedLikesInfo.createDto(
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes,
    );
  }
  private async getLikeStatus(
    postId: string,
    userId?: string,
  ): Promise<LikeStatus> {
    if (!userId) {
      return LikeStatus.None;
    }
    const foundLikeStatus = await this.postLikeModel.findOne({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!foundLikeStatus) {
      return LikeStatus.None;
    }
    return foundLikeStatus.status;
  }
  private async getNewestLikes(postId: string): Promise<LikeDetailsViewDto[]> {
    const likes = await this.postLikeModel
      .find({
        postId: new mongoose.Types.ObjectId(postId),
        status: LikeStatus.Like,
      })
      .sort({ updatedAt: -1 })
      .limit(3);
    return likes.map((like) => {
      return {
        addedAt: like.updatedAt.toISOString(),
        userId: like.userId.toString(),
        login: like.login,
      };
    });
  }
}