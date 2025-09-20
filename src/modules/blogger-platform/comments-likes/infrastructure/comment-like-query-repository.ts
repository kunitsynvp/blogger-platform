import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentLikeModelType } from '../domain/comments-like-entity';
import { CommentLike, } from '../domain/comments-like-entity';
import mongoose from 'mongoose';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CommentLikesInfoDto } from '../../comments/api/view-dto/comment-likes-info-dto';
import { GetCommentLikesInfoDto } from './dto/get-like-status-dto';

@Injectable()
export class CommentLikeQueryRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: CommentLikeModelType,
  ) {}

  async getMyLikesInfo(dto: GetCommentLikesInfoDto): Promise<CommentLikesInfoDto> {
    const likesAmount = await this.commentLikeModel.countDocuments({
      commentId: new mongoose.Types.ObjectId(dto.commentId),
      status: LikeStatus.Like,
    });
    const dislikesAmount = await this.commentLikeModel.countDocuments({
      commentId: new mongoose.Types.ObjectId(dto.commentId),
      status: LikeStatus.Dislike,
    });
    const myStatus: LikeStatus =  await this.getLikeStatus(dto.commentId,dto.userId)

    return {
      likesCount: likesAmount,
      dislikesCount: dislikesAmount,
      myStatus: myStatus,
    }

  }
  private async getLikeStatus(commentId: string,userId?: string): Promise<LikeStatus> {
    if(!userId) {
      return LikeStatus.None
    }
    const foundLikeStatus = await this.commentLikeModel.findOne({
      commentId: new mongoose.Types.ObjectId(commentId),
      userId: new mongoose.Types.ObjectId(userId),
    })
    if (!foundLikeStatus) {
      return LikeStatus.None;
    }
    return foundLikeStatus.status
  }

}