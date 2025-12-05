import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { questionsDbConstraints } from './constraints/questions-constraints';
import { CreateQuestionInputDto } from '../../api/input-dto/create-question-input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

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

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone' })
  updatedAt: Date;

  static createQuestion(dto: CreateQuestionInputDto): Question {
    const newQuestion = new Question();
    newQuestion.body = dto.body;
    newQuestion.correctAnswers = dto.correctAnswers;
    newQuestion.isPublished = false
    newQuestion.createdAt = new Date();
    //TODO it may be invalid logic, possibly fix in the future
    newQuestion.updatedAt = new Date();

    newQuestion.validate()
    return newQuestion;
  }
  validate() {
    if (this.body.length <= 10 && this.body.length >= 500) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: "Validation in domain failed" ,
        field: 'body'});
    }
  }
}