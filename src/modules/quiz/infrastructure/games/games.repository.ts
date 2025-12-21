import { DataSource, Repository } from 'typeorm';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Game } from '../../domain/games/games.entity';
import { GameStatus } from '../../domain/dto/game-statuses';
import { BaseRepository } from '../../../../core/base repo/base-repository';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { plainToInstance } from 'class-transformer';

@Injectable({ scope: Scope.REQUEST })
export class GamesRepository extends BaseRepository {
  private games: Repository<Game>

  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
    this.games = this.getRepository<Game>(Game)
  }

  async saveInDb(game: Game): Promise<Game> {
    return await this.games.save(game);
  }
  async findPendingGame(): Promise<Game | null> {
    const foundGame = await this.games.findOneBy({
      status: GameStatus.pending,
    });
    return foundGame;
  }
  async findGameById(gameId: string): Promise<Game | null> {
    const foundGame = await this.games.findOneBy({
      id: gameId,
    });
    return foundGame;
  }
  async findActiveGameForUser(userId: number): Promise<Game | null> {
    const foundGame = await this.games
      .createQueryBuilder('g')
      //.setLock('pessimistic_write')
      .select([
        'g.id as id',
        'g.status as status',
        'g."pairCreatedDate" as "pairCreatedDate"',
        'g."startGameDate" as "startGameDate"',
        'g."finishGameDate" as "finishGameDate"'
      ])
      .innerJoin('g.players', 'p')
      .where('p."userId" = :userId', { userId: userId })
      .andWhere('g.status = :status', {status: GameStatus.active})
      .getRawOne<Game>()
    if(!foundGame) {
      return null
    }
    return plainToInstance(Game,foundGame)
  }
}
// export const GamesRepository = Symbol('GamesRepository');
// export interface GamesRepositoryCustomFields{
//   saveInDb(game: Game): Promise<Game>;
//   findPendingGame(): Promise<Game|null>;
//   findGameById(gameId: string): Promise<Game|null>;
//   findActiveGameForUserWithPWLock(userId: number): Promise<Game|null>;
// }
// export interface GamesRepository extends Repository<Game>,GamesRepositoryCustomFields {}
// export function createGamesRepository(dataSource: DataSource):GamesRepository {
//   return dataSource.getRepository(Game).extend<GamesRepositoryCustomFields>({
//     async saveInDb(game: Game): Promise<Game> {
//       return await this.save(game);
//     },
//     async findPendingGame(): Promise<Game | null> {
//       const foundGame = await this.findOneBy({
//         status: GameStatus.pending,
//       });
//       return foundGame;
//     },
//     async findGameById(gameId: string): Promise<Game | null> {
//       const foundGame = await this.findOneBy({
//         id: gameId,
//       });
//       return foundGame;
//     },
//     async findActiveGameForUserWithPWLock(userId: number): Promise<Game | null> {
//       const foundGame = await this.findOne({
//         relations: { players: true },
//         where: {
//           status: GameStatus.active,
//           players: {
//             userId: userId,
//           },
//         },
//         lock: {
//           mode: 'pessimistic_write'
//         }
//       });
//       return foundGame;
//     }
//   })
// }
