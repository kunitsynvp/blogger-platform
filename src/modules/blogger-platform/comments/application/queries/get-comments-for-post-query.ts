import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/comments-query.repository';
import { CommentsViewDto } from '../../api/view-dto/comments-view-dto';
import { CommentsQueryDto } from '../../api/input-dto/comments-query-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts-query.repository';

export class GetCommentsForPostQuery {
  constructor(public queryParams: CommentsQueryDto,
              public postId: string,
              public user?: string,) {
  }
}
@QueryHandler(GetCommentsForPostQuery)
export class GetCommentsForPostQueryHandler implements IQueryHandler<
  GetCommentsForPostQuery,
  PaginatedViewDto<CommentsViewDto[]>>{
  constructor(private commentsQueryRepository: CommentsQueryRepository,
              private postsQueryRepository: PostsQueryRepository,) {}

  async execute(query: GetCommentsForPostQuery): Promise<PaginatedViewDto<CommentsViewDto[]>>{
    await this.postsQueryRepository.findByIdOrFail(query.postId)
    return await this.commentsQueryRepository.findAllComments(query.queryParams,query.postId,query.user);
  }
}