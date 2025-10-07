import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsViewDto } from '../../api/view-dto/posts-view-dto';
import { PostsSqlQueryRepository } from '../../infrastructure/posts-sql.query.repository';

export class GetPostByIdOrFailQuery {
  constructor(
    public id: number,
    public userId?: number,
  ) {}
}
@QueryHandler(GetPostByIdOrFailQuery)
export class GetPostByIdOrFailQueryHandler
  implements IQueryHandler<GetPostByIdOrFailQuery, PostsViewDto>
{
  constructor(private postsQueryRepository: PostsSqlQueryRepository) {}
  async execute(query: GetPostByIdOrFailQuery): Promise<PostsViewDto> {
    return await this.postsQueryRepository.findByIdOrFail(
      query.id,
      query?.userId,
    );
  }
}