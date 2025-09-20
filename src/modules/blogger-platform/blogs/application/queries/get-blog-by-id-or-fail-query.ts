import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsViewDto } from '../../api/view-dto/blogs-view-dto';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogByIdOrFailQuery {
  constructor(public id: string) {}
}
@QueryHandler(GetBlogByIdOrFailQuery)
export class GetBlogByIdOrFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrFailQuery, BlogsViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}
  async execute(query: GetBlogByIdOrFailQuery): Promise<BlogsViewDto> {
    return await this.blogsQueryRepository.findBlogsByIdOrFail(query.id);
  }
}