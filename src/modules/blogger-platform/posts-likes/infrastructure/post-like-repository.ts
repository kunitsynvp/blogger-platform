import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/posts-like.entity';
import { GetPostLikeStatusDto } from './dto/get-post-like-status-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostLike) private postLikes: Repository<PostLike>,
  ) {}
  async save(postLike: PostLike): Promise<PostLike> {
    return await this.postLikes.save(postLike);
  }

  async getLikeStatus(dto: GetPostLikeStatusDto): Promise<PostLike | null> {
    const status = await this.postLikes.findOneBy({
      postId: dto.postId,
      userId: dto.userId,
    });
    if (!status) {
      return null;
    }
    return status;
  }
}