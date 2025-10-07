import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionViewDto } from '../../../api/view-dto/session-view-dto';
import {
  SessionsSqlQueryRepository,
} from '../../../infrastructure/sessions/sessions-sql-query-repository';

export class GetSessionsQuery {
  constructor(public userId: number) {}
}
@QueryHandler(GetSessionsQuery)
export class GetSessionsQueryHandler
  implements IQueryHandler<GetSessionsQuery, SessionViewDto[]>
{
  constructor(private sessionQueryRepository: SessionsSqlQueryRepository) {}
  async execute(query: GetSessionsQuery): Promise<SessionViewDto[]> {
    return await this.sessionQueryRepository.findActiveSessionsByUserId(
      query.userId,
    );
  }
}