import { Injectable } from '@nestjs/common';
import { Blog, BlogDbType } from '../domain/blog.entity';
import { BlogsQueryDto } from '../api/input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../api/view-dto/blogs-view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findAllBlogs(
    query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const blogs: BlogDbType[] = await this.dataSource.query(
      `
      SELECT * FROM "Blogs"
      ${query.searchNameTerm ? ` WHERE name ILIKE '%${query.searchNameTerm}%' ` : ''}
      ORDER BY "${query.sortBy}" ${query.sortDirection.toUpperCase()}
      LIMIT $1
      OFFSET $2;
      `, [query.pageSize, query.calculateSkip()]
    );

    const totalCount: [{ count: string }] = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM "Blogs"
      ${query.searchNameTerm ? ` WHERE name ILIKE '%${query.searchNameTerm}%' ` : ''}
      `,
    );
    const blogsInstances = plainToInstance(Blog, blogs);

    const items = blogsInstances.map(BlogsViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: +totalCount[0].count,
      items: items,
    });
  }
  async findBlogByIdOrFail(id: number): Promise<BlogsViewDto> {
    const foundBlog: BlogDbType[] = await this.dataSource.query(
      `
      SELECT * FROM "Blogs"
      WHERE id = $1
      `,
      [id],
    );
    if (foundBlog.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    const blogInstance = plainToInstance(Blog, foundBlog[0]);
    return BlogsViewDto.mapToView(blogInstance);
  }
}