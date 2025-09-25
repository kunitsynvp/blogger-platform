import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionViewDto } from '../../../api/view-dto/session-view-dto';
import { SessionsQueryRepository } from '../../../infrastructure/sessions-query-repository';

export class GetSessionsQuery {
  constructor(public userId: string) {}
}
@QueryHandler(GetSessionsQuery)
export class GetSessionsQueryHandler
  implements IQueryHandler<GetSessionsQuery, SessionViewDto[]>
{
  constructor(private sessionQueryRepository: SessionsQueryRepository) {}
  async execute(query: GetSessionsQuery): Promise<SessionViewDto[]> {
    return await this.sessionQueryRepository.findActiveSessionsByUserId(
      query.userId,
    );
  }
}