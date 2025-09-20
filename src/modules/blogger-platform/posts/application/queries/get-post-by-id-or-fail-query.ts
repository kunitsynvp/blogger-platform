import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts-query.repository';
import { PostsViewDto } from '../../api/view-dto/posts-view-dto';

export class GetPostByIdOrFailQuery {
  constructor(public id: string,
              public userId?: string) {}
}
@QueryHandler(GetPostByIdOrFailQuery)
export class GetPostByIdOrFailQueryHandler
  implements IQueryHandler<GetPostByIdOrFailQuery, PostsViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetPostByIdOrFailQuery): Promise<PostsViewDto> {
    return await this.postsQueryRepository.findByIdOrFail(query.id,query?.userId);
  }
}