import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './input-dto/login-user-dto';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { ConfirmationCodeDto } from './input-dto/confirmation-code-dto';
import { EmailDto } from './input-dto/email-dto';
import { JwtAccessTokenAuthGuard } from '../guards/bearer/jwt-access-token-auth-guard';
import { CurrentUser } from '../guards/decorators/current-user-param-decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/me-view-dto';
import { NewPasswordDto } from './input-dto/new-password-dto';
import { ConfirmEmailCommand } from '../application/use-cases/auth/confirm-email-use-case';
import { LoginCommand } from '../application/use-cases/auth/login-use-case';
import { RegistrationCommand } from '../application/use-cases/auth/registration-use-case';
import { SendRecoveryCodeCommand } from '../application/use-cases/auth/send-recovery-code-use-case';
import { UpdateConfirmationCodeCommand } from '../application/use-cases/auth/update-confirmation-code-use-case';
import { UpdatePasswordCommand } from '../application/use-cases/auth/update-password-use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetMeQuery } from '../application/queries/auth/get-me-query';
import type { Response } from 'express';
import { GetIpAndDeviceName } from '../../../core/decorators/get-ip-device-name-decorator';
import { IpAndDeviceNameDto } from './input-dto/ip-and-device-name-dto';
import { LoginUserCommandDto } from '../application/dto/login-user-command-dto';
import { JwtRefreshTokenAuthGuard } from '../guards/bearer/jwt-refresh-token-auth-guard.';
import { UpdateTokensPairCommand } from '../application/use-cases/auth/update-tokens-pair-use-case';
import { AccessAndRefreshToken } from '../application/dto/access-and-refresh-token';
import { GetUserInfo } from '../../../core/decorators/user-info-decorator';
import { UserInfoDto } from '../guards/dto/user-info-dto';
import { LogoutCommand } from '../application/use-cases/auth/logout-use-case';
import { SkipThrottle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../../../core/throttler/throttler';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';

@UseGuards(CustomThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private usersSqlRepository: UsersSqlRepository,
  ) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginUserDto,
    @GetIpAndDeviceName() ipAndDeviceName: IpAndDeviceNameDto,
  ): Promise<{ accessToken: string }> {
    const commandDto = LoginUserCommandDto.createDto(
      dto.loginOrEmail,
      dto.password,
      ipAndDeviceName.ip,
      ipAndDeviceName.title,
    );
    const result = await this.commandBus.execute<
      LoginCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginCommand(commandDto));

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: result.accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: CreateUserInputDto): Promise<void> {
    return await this.commandBus.execute<RegistrationCommand, void>(
      new RegistrationCommand(dto),
    );
  }
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() dto: ConfirmationCodeDto,
  ): Promise<void> {
    return await this.commandBus.execute<ConfirmEmailCommand, void>(
      new ConfirmEmailCommand(dto),
    );
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() dto: EmailDto): Promise<void> {
    console.log('registration email resending endpoint called');
    return await this.commandBus.execute<UpdateConfirmationCodeCommand, void>(
      new UpdateConfirmationCodeCommand(dto),
    );
  }
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenAuthGuard)
  @HttpCode(200)
  @SkipThrottle()
  async generateNewTokensPair(
    @CurrentUser() dto: UserContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      UpdateTokensPairCommand,
      AccessAndRefreshToken
    >(new UpdateTokensPairCommand(dto.userId, dto.deviceId));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: accessToken };
  }
  @Get('me')
  @UseGuards(JwtAccessTokenAuthGuard)
  @SkipThrottle()
  async authMeHandler(@CurrentUser() user: UserContextDto): Promise<MeViewDto> {
    return await this.queryBus.execute<GetMeQuery, MeViewDto>(
      new GetMeQuery(user.userId),
    );
  }
  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  @SkipThrottle()
  async logout(@GetUserInfo() dto: UserInfoDto) {
    return await this.commandBus.execute<LogoutCommand, void>(
      new LogoutCommand(dto.userId, dto.deviceId),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: EmailDto): Promise<void> {
    return await this.commandBus.execute<SendRecoveryCodeCommand, void>(
      new SendRecoveryCodeCommand(dto),
    );
  }
  @Post('new-password')
  async newPassword(@Body() dto: NewPasswordDto): Promise<void> {
    return await this.commandBus.execute<UpdatePasswordCommand, void>(
      new UpdatePasswordCommand(dto),
    );
  }

  @Get('get-users')
  @HttpCode(200)
  async getUsers() {
    return await this.usersSqlRepository.findUsers();
  }
  @Get('get-user-by-id')
  @HttpCode(200)
  async getUsersById(@Body() dto: { id: string }) {
    return await this.usersSqlRepository.findById(dto.id);
  }
}