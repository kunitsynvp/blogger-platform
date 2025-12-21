import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair-view-dto';
import { GamesQueryRepository } from '../../infrastructure/games/games.query.repository';

export class GetActiveGameForUserQuery {
  constructor(public userId: number) {}
}
@QueryHandler(GetActiveGameForUserQuery)
export class GetActiveGameForUserQueryHandler
  implements IQueryHandler<GetActiveGameForUserQuery, GamePairViewDto>
{
  constructor(private gamesQueryRepository: GamesQueryRepository) {}
  async execute(query: GetActiveGameForUserQuery): Promise<GamePairViewDto> {
    return await this.gamesQueryRepository.findActiveGameByUserId(query.userId);
  }
}