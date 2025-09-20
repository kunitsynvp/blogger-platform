import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts-query.repository';
import { PostsViewDto } from '../../api/view-dto/posts-view-dto';
import { PostsQueryDto } from '../../api/input-dto/posts-query-dto';

export class GetPostsQuery {
  constructor(public queryParams: PostsQueryDto,
              public userId? : string) {}
}
@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostsViewDto[]>>
{
  constructor(private postsQueryRepository: PostsQueryRepository) {}
  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return await this.postsQueryRepository.findAllPosts(query.queryParams, undefined, query.userId);
  }
}