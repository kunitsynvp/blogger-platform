import { Injectable } from '@nestjs/common';
import { Post, PostDbType } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource,
              @InjectRepository(Post) private posts: Repository<Post>) {}
  async save(post: Post): Promise<Post> {
    return await this.posts.save(post);
  }

  async findPostByIdOrFail(postId: number): Promise<Post> {
    const foundPost:PostDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Posts" WHERE id = $1
    `, [postId]
    );
    if (foundPost.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `post not found`,
        field: 'id',
      });
    }
    return plainToInstance(Post, foundPost[0]);
  }

  async deletePostOrFail(id: number): Promise<void> {
    const foundPost: PostDbType[] = await this.dataSource.query(`
      SELECT * FROM "Posts" WHERE id = $1
    `, [id]);
    if (foundPost.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `post not found`,
        field: 'id',
      });
    }
    await this.dataSource.query(`
      DELETE FROM "Posts" WHERE id = $1
    `,[id])
  }
}