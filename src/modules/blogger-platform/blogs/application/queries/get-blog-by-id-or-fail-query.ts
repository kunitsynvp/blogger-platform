import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsViewDto } from '../../api/view-dto/blogs-view-dto';
import { BlogsSqlQueryRepository } from '../../infrastructure/blogs.sql.query-repository';

export class GetBlogByIdOrFailQuery {
  constructor(public id: number) {}
}
@QueryHandler(GetBlogByIdOrFailQuery)
export class GetBlogByIdOrFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrFailQuery, BlogsViewDto>
{
  constructor(private blogsQueryRepository: BlogsSqlQueryRepository) {}
  async execute(query: GetBlogByIdOrFailQuery): Promise<BlogsViewDto> {
    return await this.blogsQueryRepository.findBlogByIdOrFail(query.id);
  }
}