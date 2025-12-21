import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../user-accounts/domain/user/user.entity';
import { Game } from '../games/games.entity';
import { Answer } from '../answers/answers.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.players)
  @JoinColumn()
  user: User;
  @Column({ type: 'integer' })
  userId: number;

  @OneToMany(() => Answer, (Answer) => Answer.player)
  answers: Answer[];

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn()
  game: Game;
  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'integer' })
  score: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;

  static createPlayer(userId: number, gameId: string): Player {
    const createdPlayer = new Player();
    createdPlayer.userId = userId;
    createdPlayer.gameId = gameId;
    createdPlayer.score = 0;

    return createdPlayer;
  }
  addOnePointToScore() {
    this.score++;
    return this;
  }
}
