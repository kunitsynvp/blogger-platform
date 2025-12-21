import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GamesRepository } from '../modules/quiz/infrastructure/games/games.repository';
import { TransactionInterceptor } from '../core/interceptors/transaction-interceptor';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() private datasource: DataSource,
    private gamesRepository: GamesRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const query = `
        DELETE FROM "EmailConfirmations";
        DELETE FROM "PasswordRecoveries";
        DELETE FROM "Sessions";
        DELETE FROM "CommentLikes";
        DELETE FROM "PostLikes";
        DELETE FROM "Comments";
        DELETE FROM "Posts";
        DELETE FROM "Blogs";
        delete from "Answers";
        delete from "Players";
        delete from "GameQuestions";
        delete from "Games";
        DELETE FROM "Users";
        DELETE FROM "Questions";
    `;

    await this.datasource.query(query);
    return {
      status: 'succeeded',
    };
  }
  @Get('test')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(TransactionInterceptor)
  async testErrors() {
    const game = await this.gamesRepository.findActiveGameForUser(1981);
    return game;
  }
}
