import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private comments: Repository<Comment>,
  ) {}

  async save(comment: Comment): Promise<Comment> {
    return await this.comments.save(comment);
  }
  async findByIdOrFail(commentId: number): Promise<Comment> {
    const foundComment = await this.comments.findOneBy({ id: commentId });
    if (!foundComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        field: 'commentId',
      });
    }
    return foundComment
  }
  async deleteCommentOrFail(commentId: number): Promise<void> {
    const foundComment = await this.findByIdOrFail(commentId);
    await this.comments.delete(foundComment.id);
  }
}