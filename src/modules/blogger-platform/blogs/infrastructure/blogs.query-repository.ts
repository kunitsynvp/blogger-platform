import { Injectable } from '@nestjs/common';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryDto } from '../api/input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../api/view-dto/blogs-view-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}
  async findAllBlogs(
    query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const filter: FilterQuery<Blog> = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }
    const blogs = await this.blogModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);

    const items = blogs.map(BlogsViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
  async findBlogsByIdOrFail(id: string): Promise<BlogsViewDto> {
    const foundBlog = await this.blogModel.findById(id);
    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Blog not found",
        field: "id"
      });
    }
    return BlogsViewDto.mapToView(foundBlog);
  }
}