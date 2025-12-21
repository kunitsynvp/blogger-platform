import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnswerStatus } from '../dto/answer-statuses';
import { Player } from '../players/players.entity';
import { Question } from '../questions/question.entity';
import { CreateAnswerDomainDto } from '../dto/create-answer-domain-dto';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: AnswerStatus })
  status: string;

  @ManyToOne(() => Player, (player) => player.answers)
  @JoinColumn()
  player: Player;
  @Column({ type: 'integer' })
  playerId: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn()
  question: Question;
  @Column({ type: 'integer' })
  questionId: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  addedAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;

  static createAnswer(dto: CreateAnswerDomainDto): Answer {
    const newAnswer = new Answer();
    newAnswer.status = dto.status;
    newAnswer.questionId = dto.questionId;
    newAnswer.playerId = dto.playerId;
    return newAnswer;
  }
}
