import { Injectable } from '@nestjs/common';
import type { CommentDbType } from '../domain/comment.entity';
import { Comment } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectDataSource() private dataSource:DataSource,
  ) {}

  // async save(comment: CommentDocument): Promise<CommentDocument> {
  //   return await comment.save();
  // }
  async createComment(comment: Comment): Promise<number> {
    const wrappedId: [{id: number}] = await this.dataSource.query(`
      INSERT INTO "Comments"(content, "postId", "userId", "createdAt")
      VALUES($1, $2, $3, $4)
      RETURNING id
    `, [comment.content,comment.postId,comment.userId, new Date()])
    const id = wrappedId[0].id
    return id
  }
  async updateComment(comment: Comment):Promise<void> {
    return await this.dataSource.query(`
      UPDATE "Comments" 
      SET content = $1
        WHERE id = $2
    `,[comment.content, comment.id])
  }
  async findByIdOrFail(commentId: number): Promise<Comment> {
    const foundComment:CommentDbType[] = await this.dataSource.query(`
    SELECT * FROM "Comments" WHERE id = $1
      `,[commentId])
    if(foundComment.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        field: 'commentId',
      });
    }
    return plainToInstance(Comment, foundComment[0])
  }
  async deleteCommentOrFail(commentId: number): Promise<void> {
    const foundComment = await this.findByIdOrFail(commentId);
    await this.dataSource.query(`
        DELETE FROM "CommentLikes" 
               WHERE "commentId" = $1
    `,[commentId])
    await this.dataSource.query(
      `
        DELETE FROM "Comments" 
               WHERE id = $1
      `, [foundComment.id]
    )
  }
}