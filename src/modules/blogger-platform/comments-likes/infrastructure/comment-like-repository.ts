import { Injectable } from '@nestjs/common';
import { CommentLike } from '../domain/comments-like.entity';
import { GetCommentLikesInfoDto } from './dto/get-like-status-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(CommentLike)
    private commentLikes: Repository<CommentLike>,
  ) {}
  async save(commentLike: CommentLike): Promise<CommentLike> {
    return await this.commentLikes.save(commentLike);
  }
  async getLikeStatus(
    dto: GetCommentLikesInfoDto,
  ): Promise<CommentLike | null> {
    const commentLike = await this.commentLikes.findOneBy({
      commentId: dto.commentId,
      userId: dto.userId,
    });
    if (!commentLike) {
      return null;
    }
    return commentLike;
  }
}