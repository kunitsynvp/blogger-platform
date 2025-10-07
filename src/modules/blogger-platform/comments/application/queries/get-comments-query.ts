import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsViewDto } from '../../api/view-dto/comments-view-dto';
import { CommentsQueryDto } from '../../api/input-dto/comments-query-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments-sql-query.repository';

export class GetCommentsQuery {
  constructor(public queryParams: CommentsQueryDto) {
  }
}
@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler implements IQueryHandler<
  GetCommentsQuery,
  PaginatedViewDto<CommentsViewDto[]>>{
  constructor(private commentsQueryRepository: CommentsSqlQueryRepository) {}

  async execute(query: GetCommentsQuery): Promise<PaginatedViewDto<CommentsViewDto[]>>{
    return await this.commentsQueryRepository.findAllComments(query.queryParams);
  }
}