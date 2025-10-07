import { Injectable } from '@nestjs/common';
import { PostLike, PostLikeDbType } from '../domain/posts-like-entity';
import { GetPostLikeStatusDto } from './dto/get-post-like-status-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostLikeSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // async save(commentLike: PostLikeDocument): Promise<PostLikeDocument> {
  //   return await commentLike.save();
  // }
  async createLikeStatus(postLike: PostLike) : Promise<void> {
    await this.dataSource.query(`
      INSERT INTO "PostLikes"("postId","userId", "likeStatus", "createdAt")
      VALUES ($1,$2,$3,$4)
    `,[postLike.postId,postLike.userId, postLike.likeStatus, new Date()])
  }
  async updateLikeStatus(postLike: PostLike) : Promise<void> {
    await this.dataSource.query(`
        UPDATE "PostLikes"
        SET "likeStatus" = $1
    `, [postLike.likeStatus])
  }
  async getLikeStatus(
    dto: GetPostLikeStatusDto,
  ): Promise<PostLike | null> {
    const status: PostLikeDbType[] = await this.dataSource.query(
      `
      SELECT * FROM "PostLikes"
      WHERE "postId" = $1 AND "userId" = $2
    `,
      [dto.postId, dto.userId],
    );
    if (status.length === 0) {
      return null;
    }
    return plainToInstance(PostLike, status[0]);
  }
}