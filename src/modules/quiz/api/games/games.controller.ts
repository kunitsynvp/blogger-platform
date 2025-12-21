import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessTokenAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-token-auth-guard';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { GetUserInfo } from '../../../../core/decorators/user-info-decorator';
import { ConnectToGameCommand } from '../../application/use-cases/connect-to-game-use-case';
import { GamePairViewDto } from '../view-dto/game-pair-view-dto';
import { GetGameByIdQuery } from '../../application/queries/get-game-by-id-query';
import { AnswerInputDto } from '../input-dto/games/answer-input-dto';
import { AnswerViewDto } from '../view-dto/answer-view-dto';
import { SetAnswerCommand } from '../../application/use-cases/set-answer-use-case';
import { GetActiveGameForUserQuery } from '../../application/queries/get-active-game-for-user-query';
import { CustomParseUuidPipe } from '../../../../core/pipes/custom-parse-uuid-pipe';
import { TransactionInterceptor } from '../../../../core/interceptors/transaction-interceptor';

@Controller('/pair-game-quiz/pairs')
@UseGuards(JwtAccessTokenAuthGuard)
export class GamesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @HttpCode(200)
  @Get('/my-current')
  async getActiveUserGame(
    @GetUserInfo() userInfo: UserContextDto,
  ): Promise<AnswerViewDto> {
    return await this.queryBus.execute<
      GetActiveGameForUserQuery,
      AnswerViewDto
    >(new GetActiveGameForUserQuery(userInfo.userId));
  }
  @HttpCode(200)
  @Get('/:gameId')
  async getGameById(
    @Param('gameId', CustomParseUuidPipe)
    gameId: string,
    @GetUserInfo() userInfo: UserContextDto,
  ) {
    return await this.queryBus.execute<GetGameByIdQuery, GamePairViewDto>(
      new GetGameByIdQuery(gameId, userInfo.userId),
    );
  }
  @HttpCode(200)
  @Post('/connection')
  @UseInterceptors(TransactionInterceptor)
  async connectToGame(
    @GetUserInfo() user: UserContextDto,
  ): Promise<GamePairViewDto> {
    const gameId = await this.commandBus.execute<ConnectToGameCommand, string>(
      new ConnectToGameCommand(user),
    );
    return await this.queryBus.execute<GetGameByIdQuery, GamePairViewDto>(
      new GetGameByIdQuery(gameId, user.userId),
    );
  }
  @HttpCode(200)
  @Post('/my-current/answers')
  @UseInterceptors(TransactionInterceptor)
  async setAnswer(
    @Body() dto: AnswerInputDto,
    @GetUserInfo() userInfo: UserContextDto,
  ): Promise<AnswerViewDto> {
    return await this.commandBus.execute<SetAnswerCommand, AnswerViewDto>(
      new SetAnswerCommand(userInfo, dto),
    );
  }
}
