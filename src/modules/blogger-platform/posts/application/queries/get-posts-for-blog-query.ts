import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsViewDto } from '../../api/view-dto/posts-view-dto';
import { PostsQueryDto } from '../../api/input-dto/posts-query-dto';
import { PostsSqlQueryRepository } from '../../infrastructure/posts-sql.query.repository';

export class GetPostsForBlogQuery {
  constructor(public queryParams: PostsQueryDto,
              public blogId: number,
              public userId?: number) {}
}
@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler
  implements IQueryHandler<GetPostsForBlogQuery, PaginatedViewDto<PostsViewDto[]>>
{
  constructor(private postsQueryRepository: PostsSqlQueryRepository) {}
  async execute(
    query: GetPostsForBlogQuery,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return await this.postsQueryRepository.findAllPosts(query.queryParams,query.blogId,query?.userId);
  }
}