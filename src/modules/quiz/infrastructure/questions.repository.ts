import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/questions/question.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question) private questions: Repository<Question>,
  ) {}

  async save(question: Question): Promise<Question> {
    return await this.questions.save(question);
  }
}
