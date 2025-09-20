import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts-query.repository';
import { PostsViewDto } from '../../api/view-dto/posts-view-dto';
import { PostsQueryDto } from '../../api/input-dto/posts-query-dto';

export class GetPostsForBlogQuery {
  constructor(public queryParams: PostsQueryDto,
              public blogId: string,
              public userId?: string) {}
}
@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler
  implements IQueryHandler<GetPostsForBlogQuery, PaginatedViewDto<PostsViewDto[]>>
{
  constructor(private postsQueryRepository: PostsQueryRepository) {}
  async execute(
    query: GetPostsForBlogQuery,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return await this.postsQueryRepository.findAllPosts(query.queryParams,query.blogId,query?.userId);
  }
}