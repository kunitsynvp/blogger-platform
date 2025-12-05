import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth-guard';
import { CreateQuestionInputDto } from '../input-dto/create-question-input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuestionViewDto } from '../view-dto/question-view-dto';
import { CreateQuestionCommand } from '../../application/use-cases/create-question-use-case';
import { QuestionsQueryDto } from '../input-dto/questions-query-dto';
import { GetQuestionsQuery } from '../../application/queries/get-questions-query';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetQuestionByIdQuery } from '../../application/queries/get-question-query';

@Controller('quiz/questions')
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getQuestions(
    @Query() query: QuestionsQueryDto,
  ): Promise<PaginatedViewDto<QuestionViewDto>> {
    return await this.queryBus.execute<
      GetQuestionsQuery,
      PaginatedViewDto<QuestionViewDto>
    >(new GetQuestionsQuery(query));
  }
  @UseGuards(BasicAuthGuard)
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
}
