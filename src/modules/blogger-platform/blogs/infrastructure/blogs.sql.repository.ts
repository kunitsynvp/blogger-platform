import { Injectable } from '@nestjs/common';
import { Blog, BlogDbType } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // async save(blog: BlogDocument): Promise<BlogDocument> {
  //   return await blog.save();
  // }
  async createBlog(blog: Blog): Promise<number> {
    const wrappedBlogId: [{ id: number }] = await this.dataSource.query(
      `
    INSERT INTO "Blogs" (name, description, "websiteUrl", "isMembership","createdAt")
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id
    `,
      [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.createdAt,
      ],
    )
    const blogId = wrappedBlogId[0].id
    return blogId
  }
  async updateBlog(blog: Blog): Promise<void> {
    await this.dataSource.query(`
      UPDATE "Blogs" 
      SET name = $1,
          description = $2,
          "websiteUrl" = $3
      WHERE id = $4
    `, [blog.name,blog.description,blog.websiteUrl,blog.id])
  }

  async findBlogByIdOrFail(id: number): Promise<Blog> {
    const foundBlog: BlogDbType[] = await this.dataSource.query(
      `
      SELECT * FROM "Blogs" WHERE id = $1
      `,[id]
      );
    if (foundBlog.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    return plainToInstance(Blog, foundBlog[0])
  }

  async deleteBlogOrFail(id: number): Promise<void> {
    const foundBlog = await this.dataSource.query(`
    SELECT * FROM "Blogs" WHERE id = $1
    `, [id]
    );
    if (foundBlog.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    await this.dataSource.query(`    
    DELETE FROM "Blogs" WHERE id = $1
    `,[id]
    )
    await this.dataSource.query(`
    DELETE FROM "Posts" WHERE "blogId" = $1;
    `,[id]
    )
  }
}