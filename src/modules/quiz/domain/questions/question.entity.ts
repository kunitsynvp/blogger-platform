import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { questionsDbConstraints } from './constraints/questions-constraints';
import { CreateQuestionInputDto } from '../../api/input-dto/questions/create-question-input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UpdateQuestionInputDto } from '../../api/input-dto/questions/update-question-input-dto';
import { Answer } from '../answers/answers.entity';
import { GameQuestion } from '../games-questions/games-questions.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    collation: 'C',
    length: questionsDbConstraints.bodyMaxLength,
  })
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column({ type: 'boolean' })
  isPublished: boolean;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.question)
  gameQuestions: GameQuestion[];

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  updatedAt: Date | null;

  static createQuestion(dto: CreateQuestionInputDto): Question {
    const newQuestion = new Question();
    newQuestion.body = dto.body;
    newQuestion.correctAnswers = dto.correctAnswers;
    newQuestion.isPublished = false;
    newQuestion.updatedAt = null;

    newQuestion.validate();
    return newQuestion;
  }
  validate() {
    if (this.body.length <= 10 && this.body.length >= 500) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation in domain failed',
        field: 'body',
      });
    }
  }
  changePublishStatus(newPublishStatus: boolean) {
    this.isPublished = newPublishStatus;
    this.updatedAt = new Date();
    return this;
  }
  updateQuestion(dto: UpdateQuestionInputDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }
}