import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const query = `
        DELETE FROM "EmailConfirmations";
        DELETE FROM "PasswordRecoveries";
        DELETE FROM "CommentLikes";
        DELETE FROM "PostLikes";
        DELETE FROM "Comments";
        DELETE FROM "Sessions";
        DELETE FROM "Posts";
        DELETE FROM "Blogs";
        DELETE FROM "Users";
    `;
    await this.datasource.query(query);
    return {
      status: 'succeeded',
    };
  }
}
