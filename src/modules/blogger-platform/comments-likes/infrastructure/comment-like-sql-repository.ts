import { Injectable } from '@nestjs/common';
import { CommentLike, CommentLikeDbType } from '../domain/comments-like-entity';
import { GetCommentLikesInfoDto } from './dto/get-like-status-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentLikeSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // async save(commentLike: CommentLikeDocument): Promise<CommentLikeDocument> {
  //   return await commentLike.save();
  // }
  async getLikeStatus(
    dto: GetCommentLikesInfoDto,
  ): Promise<CommentLike | null> {
    const commentLike: CommentLikeDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "CommentLikes"
        WHERE "commentId" = $1 AND "userId" = $2
        `,
      [dto.commentId, dto.userId],
    );
    if (commentLike.length === 0) {
      return null;
    }
    return plainToInstance(CommentLike, commentLike[0]);
  }
  async createLikeStatus(commentLike:CommentLike):Promise<void> {
    return await this.dataSource.query(`
      INSERT INTO "CommentLikes"("userId", "commentId","likeStatus","createdAt")
      VALUES ($1, $2, $3, $4)
    `,[commentLike.userId,commentLike.commentId, commentLike.status,new Date()])
  }
  async updateLikeStatus(commentLike:CommentLike):Promise<void> {
    return await this.dataSource.query(`
      UPDATE "CommentLikes" 
      SET "likeStatus" = $1
          WHERE id = $2
    `,[commentLike.status,commentLike.id])
  }
}