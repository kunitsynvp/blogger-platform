import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewDto } from '../../api/view-dto/game-pair-view-dto';
import { GamesQueryRepository } from '../../infrastructure/games/games.query.repository';

export class GetGameByIdQuery {
  constructor(public gameId: string,
              public userId: number,) {}
}
@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler
  implements IQueryHandler<GetGameByIdQuery, GamePairViewDto>
{
  constructor(private gamesQueryRepository: GamesQueryRepository) {}
  async execute(query: GetGameByIdQuery): Promise<GamePairViewDto> {
    return await this.gamesQueryRepository.findGameByIdAndUserId(query.gameId, query.userId);
  }
}