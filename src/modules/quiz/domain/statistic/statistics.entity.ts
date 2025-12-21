import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatus } from '../dto/game-statuses';
import { GameQuestion } from '../games-questions/games-questions.entity';
import { Player } from '../players/players.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: GameStatus })
  status: string;

  @OneToMany(() => GameQuestion, (GameQuestion) => GameQuestion.game)
  gameQuestions: GameQuestion[];

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  @Column({ type: 'timestamp without time zone' })
  pairCreatedDate: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  finishGameDate: Date | null;

  static createGame(): Game {
    const createdGame = new Game();
    createdGame.status = GameStatus.pending;
    createdGame.pairCreatedDate = new Date();
    createdGame.startGameDate = null;
    createdGame.finishGameDate = null;

    return createdGame;
  }

  startGame(): Game {
    this.validateStartGame()
    this.startGameDate = new Date();
    this.status = GameStatus.active;

    return this;
  }
  finishGame(): Game {
    this.validateFinishGame()
    this.finishGameDate = new Date();
    this.status = GameStatus.finished;

    return this;
  }
  private validateStartGame() {
    if (this.status !== GameStatus.pending) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `To start game, game status must be ${GameStatus.pending}`,
        field : "None"
      });
    }
    if(
      this.finishGameDate !== null ||
      this.startGameDate !== null
    ){
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "To start game, finishGameDate and startGameDate must be null",
        field : "None"
      });
    }
  }
  private validateFinishGame() {
    if (this.status !== GameStatus.active) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "To finish game, game status must be 'Active'",
        field : "None"
      });
    }
    if(this.finishGameDate !== null){
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: "To finish game, finishGameDate must be null",
        field : "None"
      });
    }
  }
}
