import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Game } from '../games/games.entity';
import { Question } from '../questions/question.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, (Game) => Game.gameQuestions)
  @JoinColumn()
  game: Game;
  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Question, (question) => question.gameQuestions)
  @JoinColumn()
  question: Question;
  @Column({ type: 'integer' })
  questionId: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;

  static create(gameId: string, questionId: number): GameQuestion {
    const createdGameQuestion = new GameQuestion();
    createdGameQuestion.questionId = questionId;
    createdGameQuestion.gameId = gameId;

    return createdGameQuestion;
  }
}
