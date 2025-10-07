import { Injectable } from '@nestjs/common';
import { Post, PostDbType } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // async save(post: PostDocument): Promise<PostDocument> {
  //   return await post.save();
  // }
  async createPost(post: Post): Promise<number> {
    const wrappedPostId: number = await this.dataSource.query(`
      INSERT INTO "Posts"(title, "shortDescription",content, "blogId","createdAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,[
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.createdAt
    ])
    const postId = wrappedPostId[0].id;
    return postId;
  }
  async updatePost(post: Post): Promise<void> {
    await this.dataSource.query(`
      UPDATE "Posts"
      SET title = $1, 
        "shortDescription" = $2, 
        content = $3
      WHERE id = $4
    `,[post.title, post.shortDescription, post.content, post.id])
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