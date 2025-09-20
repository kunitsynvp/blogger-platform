import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/comments-query.repository';
import { CommentsViewDto } from '../../api/view-dto/comments-view-dto';
import { CommentsQueryDto } from '../../api/input-dto/comments-query-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

export class GetCommentsQuery {
  constructor(public queryParams: CommentsQueryDto) {
  }
}
@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler implements IQueryHandler<
  GetCommentsQuery,
  PaginatedViewDto<CommentsViewDto[]>>{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute(query: GetCommentsQuery): Promise<PaginatedViewDto<CommentsViewDto[]>>{
    return await this.commentsQueryRepository.findAllComments(query.queryParams);
  }
}