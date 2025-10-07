import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsViewDto } from '../../api/view-dto/comments-view-dto';
import { UserContextDto } from '../../../../user-accounts/guards/dto/user-context.dto';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments-sql-query.repository';

export class GetCommentByIdOrFailQuery {
  constructor(
    public id: number,
    public user?: UserContextDto,
  ) {}
}
@QueryHandler(GetCommentByIdOrFailQuery)
export class GetCommentByIdOrFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrFailQuery, CommentsViewDto>
{
  constructor(private commentsQueryRepository: CommentsSqlQueryRepository) {}
  async execute(query: GetCommentByIdOrFailQuery): Promise<CommentsViewDto> {
    return await this.commentsQueryRepository.findByIdOrFail(
      query.id,
      query.user?.userId,
    );
  }
}