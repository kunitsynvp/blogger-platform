import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SessionViewDto } from './view-dto/session-view-dto';
import { JwtRefreshTokenAuthGuard } from '../guards/bearer/jwt-refresh-token-auth-guard.';
import { GetUserInfo } from '../../../core/decorators/user-info-decorator';
import { UserInfoDto } from '../guards/dto/user-info-dto';
import { GetSessionsQuery } from '../application/queries/sessions/get-sessions-query';
import { TerminateAllSessionsCommand } from '../application/use-cases/session/terminate-all-sessions-use-case';
import { TerminateSpecifiedSessionCommand } from '../application/use-cases/session/terminate-specified-sessions-use-case';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}
  @Get()
  @UseGuards(JwtRefreshTokenAuthGuard)
  async getSessions(
    @GetUserInfo() userInfo: UserInfoDto,
  ): Promise<SessionViewDto[]> {
    return await this.queryBus.execute<GetSessionsQuery, SessionViewDto[]>(
      new GetSessionsQuery(userInfo.userId),
    );
  }
  @Delete()
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async terminateAllSessionExcludeCurrent(
    @GetUserInfo() dto: UserInfoDto,
  ): Promise<void> {
    return await this.commandBus.execute<TerminateAllSessionsCommand, void>(
      new TerminateAllSessionsCommand(dto.userId, dto.deviceId),
    );
  }
  @Delete(':deviceId')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async terminateSpecifiedSession(
    @GetUserInfo() dto: UserInfoDto,
    @Param('deviceId') deviceIdURI: string,
  ): Promise<void> {
    return await this.commandBus.execute<
      TerminateSpecifiedSessionCommand,
      void
    >(new TerminateSpecifiedSessionCommand(dto.userId, deviceIdURI));
  }
}