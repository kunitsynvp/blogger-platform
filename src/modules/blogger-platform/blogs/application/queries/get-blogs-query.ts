import { BlogsQueryDto } from '../../api/input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../../api/view-dto/blogs-view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/blogs-query-repository';

export class GetBlogsQuery {
  constructor(public queryParams: BlogsQueryDto) {}
}
@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery, PaginatedViewDto<BlogsViewDto[]>>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}
  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return await this.blogsQueryRepository.findAllBlogs(query.queryParams);
  }
}