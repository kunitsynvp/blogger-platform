import { DataSource, Repository } from 'typeorm';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Player } from '../../domain/players/players.entity';
import { GameStatus } from '../../domain/dto/game-statuses';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BaseRepository } from '../../../../core/base repo/base-repository';

@Injectable({scope: Scope.REQUEST })
export class PlayersRepository extends BaseRepository {
  private players: Repository<Player>;
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
    this.players = this.getRepository(Player);
  }

  async save(player: Player): Promise<Player> {
    return await this.players.save(player);
  }
  async findPlayerById(playerId: number): Promise<Player> {
    const foundPlayer = await this.players.findOneBy({ id: playerId });
    if (!foundPlayer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Player not found',
        field: 'playerId',
      });
    }
    return foundPlayer;
  }
  async checkHasPlayerActiveOrPendingGame(userId: number): Promise<boolean> {
    const foundActiveGameCount = await this.players
      .createQueryBuilder('p')
      .innerJoin('p.game', 'g')
      .where('p.userId = :userId', { userId })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GameStatus.pending, GameStatus.active],
      })
      .getCount();
    return !!foundActiveGameCount;
  }
  async getPlayerByUserIdAndGameId(
    userId: number,
    gameId: string,
  ): Promise<Player> {
    const foundPlayer = await this.players.findOneBy({
      userId: userId,
      gameId: gameId,
    });
    if (!foundPlayer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Player not found',
        field: 'None',
      });
    }
    return foundPlayer;
  }
  async findPlayersResultForGame(
    gameId: string,
  ): Promise<PlayersResultDBRaw[]> {
    const result = await this.players
      .createQueryBuilder('players')
      .select('players.id as "playerId"')
      .addSelect('players.score as score')
      .addSelect(
        `(
        select "addedAt" from "Answers" a
        where "playerId" = players.id
        order by 1 desc
          limit 1
        ) as "lastAnswer"
      `,
      )
      .innerJoin('players.game', 'g')
      .where('g.id = :gameId', { gameId: gameId })
      .getRawMany<PlayersResultDBRaw>();

    return result;
  }
}
export class PlayersResultDBRaw {
  playerId: number;
  score: number;
  lastAnswer: Date;
}
