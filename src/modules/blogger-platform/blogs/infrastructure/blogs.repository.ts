import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private blogs: Repository<Blog>,
  ) {}
  async save(blog: Blog): Promise<Blog> {
    return await this.blogs.save(blog);
  }
  async createBlog(blog: Blog): Promise<number> {
    const createdBlog = await this.blogs
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values({
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        isMembership: blog.isMembership,
        createdAt: blog.createdAt,
      })
      .execute();

    return createdBlog.identifiers[0].id;
  }
  async updateBlog(blog: Blog): Promise<void> {
    await this.blogs
      .createQueryBuilder()
      .update(Blog)
      .set({
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
      })
      .where('id = :id', { id: blog.id })
      .execute();
  }

  async findBlogByIdOrFail(blogId: number): Promise<Blog> {
    const foundBlog = await this.blogs
      .createQueryBuilder()
      .select()
      .where('id = :id', { id: blogId })
      .getOne();

    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    return foundBlog;
  }

  async deleteBlogOrFail(id: number): Promise<void> {
    const foundBlog = await this.blogs
      .createQueryBuilder()
      .where('id = :id', { id: id })
      .getOne();

    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    await this.blogs
      .createQueryBuilder()
      .delete()
      .from(Blog)
      .where('id = :id', { id: id })
      .execute();

    await this.blogs
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('blogId = :blogId', { blogId: id })
      .execute();
  }
}