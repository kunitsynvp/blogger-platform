import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { BlogsQueryDto } from '../api/input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../api/view-dto/blogs-view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private blogs: Repository<Blog>) {}

  async findAllBlogs(
    query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {

    const whereOptions: FindOptionsWhere<Blog>[] = []
    if(query.searchNameTerm) {
      whereOptions.push({ name : ILike(`%${query.searchNameTerm}%`)})
    }
    const items = await this.blogs
      .createQueryBuilder('b')
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b."websiteUrl" as "websiteUrl"',
        'b."createdAt" as "createdAt"',
        'b."isMembership" as "isMembership"',
      ])
      .where(whereOptions)
      .skip(query.calculateSkip())
      .take(query.pageSize)
      .getRawMany<BlogsViewDto>()

    const totalCount = await this.blogs
      .createQueryBuilder('b')
      .where(whereOptions)
      .getCount()

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
  async findBlogByIdOrFail(id: number): Promise<BlogsViewDto> {
    const foundBlog = await this.blogs
      .createQueryBuilder('b')
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b."websiteUrl" as "websiteUrl"',
        'b."createdAt" as "createdAt"',
        'b."isMembership" as "isMembership"',
      ])
      .where('b.id = :id', {id: id})
      .getRawOne<BlogsViewDto>()

    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }

    return foundBlog
  }
}