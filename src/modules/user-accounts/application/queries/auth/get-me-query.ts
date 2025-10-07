import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../../api/view-dto/me-view-dto';
import { AuthQueryRepository } from '../../../infrastructure/auth.query.repository';

export class GetMeQuery {
  constructor(public userId: number) {}
}
@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<
  GetMeQuery,
  MeViewDto> {
  constructor(private authQueryRepository: AuthQueryRepository) {}
  async execute(query: GetMeQuery): Promise<MeViewDto> {
    return await this.authQueryRepository.me(query.userId)
  }
}