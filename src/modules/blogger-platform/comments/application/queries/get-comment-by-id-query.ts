import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/comments-query.repository';
import { CommentsViewDto } from '../../api/view-dto/comments-view-dto';
import { UserContextDto } from '../../../../user-accounts/guards/dto/user-context.dto';

export class GetCommentByIdOrFailQuery {
  constructor(public id: string,
              public user?: UserContextDto) {
  }
}
@QueryHandler(GetCommentByIdOrFailQuery)
export class GetCommentByIdOrFailQueryHandler implements IQueryHandler<
  GetCommentByIdOrFailQuery,
  CommentsViewDto>{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}
  async execute(query: GetCommentByIdOrFailQuery): Promise<CommentsViewDto>{
    return await this.commentsQueryRepository.findByIdOrFail(query.id,query.user?.userId);
  }
}