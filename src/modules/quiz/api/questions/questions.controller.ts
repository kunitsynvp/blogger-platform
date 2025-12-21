import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth-guard';
import { CreateQuestionInputDto } from '../input-dto/questions/create-question-input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuestionViewDto } from '../view-dto/question-view-dto';
import { CreateQuestionCommand } from '../../application/use-cases/create-question-use-case';
import { QuestionsQueryDto } from '../input-dto/questions/questions-query-dto';
import { GetQuestionsQuery } from '../../application/queries/get-questions-query';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetQuestionByIdQuery } from '../../application/queries/get-question-query';
import { CustomParseIntPipe } from '../../../../core/pipes/int-transformation-pipe';
import { PublishQuestionDto } from '../input-dto/questions/publish-question-dto';
import { ChangePublishStatusCommand } from '../../application/use-cases/change-publish-status-use-case';
import { UpdateQuestionInputDto } from '../input-dto/questions/update-question-input-dto';
import { UpdateQuestionCommand } from '../../application/use-cases/update-question-use-case';
import { DeleteQuestionCommand } from '../../application/use-cases/delete-question-use-case';

@Controller('/sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getQuestions(
    @Query() query: QuestionsQueryDto,
  ): Promise<PaginatedViewDto<QuestionViewDto>> {
    return await this.queryBus.execute<
      GetQuestionsQuery,
      PaginatedViewDto<QuestionViewDto>
    >(new GetQuestionsQuery(query));
  }

  @HttpCode(201)
  @Post()
  async postQuestion(
    @Body() dto: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {
    const createdQuestionId = await this.commandBus.execute<
      CreateQuestionCommand,
      number
    >(new CreateQuestionCommand(dto));
    return await this.queryBus.execute<GetQuestionByIdQuery, QuestionViewDto>(
      new GetQuestionByIdQuery(createdQuestionId),
    );
  }

  @HttpCode(204)
  @Put('/:questionId/publish')
  async changePublishStatus(
    @Param('questionId',CustomParseIntPipe) questionId: number,
    @Body() dto: PublishQuestionDto
  ): Promise<void> {
    return await this.commandBus.execute<
      ChangePublishStatusCommand,
      void
    >(new ChangePublishStatusCommand(questionId, dto));
  }

  @HttpCode(204)
  @Put('/:questionId')
  async updateQuestion(
    @Param('questionId',CustomParseIntPipe) questionId: number,
    @Body() dto: UpdateQuestionInputDto
  ):Promise<void> {
    return await this.commandBus.execute<
      UpdateQuestionCommand,
      void
    >(new UpdateQuestionCommand(dto, questionId));
  }
  @HttpCode(204)
  @Delete('/:questionId')
  async deleteQuestion(
    @Param('questionId',CustomParseIntPipe) questionId: number,
  ):Promise<void> {
    return await this.commandBus.execute<
      DeleteQuestionCommand,
      void
    >(new DeleteQuestionCommand(questionId));
  }
}
