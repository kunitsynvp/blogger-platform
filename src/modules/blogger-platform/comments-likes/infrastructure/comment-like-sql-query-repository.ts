import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CommentLikesInfoDto } from '../../comments/api/view-dto/comment-likes-info-dto';
import { GetCommentLikesInfoDto } from './dto/get-like-status-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLikeDbType } from '../domain/comments-like-entity';

@Injectable()
export class CommentLikeSqlQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getMyLikesInfo(
    dto: GetCommentLikesInfoDto,
  ): Promise<CommentLikesInfoDto> {
    const likesAmount = await this.countLikeStatus(
      dto.commentId,
      LikeStatus.Like,
    );
    const dislikesAmount = await this.countLikeStatus(
      dto.commentId,
      LikeStatus.Dislike,
    );
    const myStatus: LikeStatus = await this.getLikeStatus(
      dto.commentId,
      dto.userId,
    );

    return {
      likesCount: likesAmount,
      dislikesCount: dislikesAmount,
      myStatus: myStatus,
    };
  }
  private async getLikeStatus(
    commentId: number,
    userId?: number,
  ): Promise<LikeStatus> {
    if (!userId) {
      return LikeStatus.None;
    }
    const foundLikeStatus:CommentLikeDbType[] = await this.dataSource.query(`
      SELECT * FROM "CommentLikes"
      WHERE "commentId" = $1 and "userId" = $2
    `,[commentId, userId]);
    if (foundLikeStatus.length === 0) {
      return LikeStatus.None;
    }
    return foundLikeStatus[0].likeStatus;
  }
  private async countLikeStatus(
    commentId: number,
    likeStatus: LikeStatus,
  ): Promise<number> {
    const wrappedAmount: [{ count: string }] = await this.dataSource.query(
      `
        SELECT COUNT(*) FROM "CommentLikes"
        WHERE "commentId" = $1 AND "likeStatus" = $2
    `,
      [commentId, likeStatus],
    );
    const amount = +wrappedAmount[0].count;
    return amount;
  }
}