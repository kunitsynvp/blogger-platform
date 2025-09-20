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
import { LoginUserDTO } from './input-dto/login-user-dto';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { ConfirmationCodeDto } from './input-dto/confirmation-code-dto';
import { EmailDto } from './input-dto/email-dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth-guard';
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

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({passthrough: true}) res: Response,
    @Body() dto: LoginUserDTO): Promise<{ accessToken: string }> {
    res.cookie('refreshToken',"someRefreshToken.", {httpOnly: true, secure: true}); //TODO: do refreshToken properly
    const result = await this.commandBus.execute<LoginCommand,{accessToken:string}>(new LoginCommand(dto));
    return {accessToken:result.accessToken};
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: CreateUserInputDto): Promise<void> {
    return await this.commandBus.execute<RegistrationCommand,void>(new RegistrationCommand(dto));
  }
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() dto: ConfirmationCodeDto,
  ): Promise<void> {
    return await this.commandBus.execute<ConfirmEmailCommand,void>(new ConfirmEmailCommand(dto));
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() dto: EmailDto): Promise<void> {
    return await this.commandBus.execute<UpdateConfirmationCodeCommand,void>(
      new UpdateConfirmationCodeCommand(dto),
    );
  }
  // async authRefreshTokenHandler(
  //   req: RequestWithMeta<MetaInfoType & MetaType>,
  //   res: Response)  {
  //   const userId = req.meta?.userId
  //   const deviceId = req.meta?.deviceId
  //
  //   const isTokensUpdated = await this.authService.updateTokensPair(userId!, deviceId!)
  //   if (!isTokensUpdated) {
  //     res.sendStatus(HTTPSTATUS.notAuthorized_401)
  //     return
  //   }
  //   const {accessToken, refreshToken} = isTokensUpdated
  //
  //   res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true});
  //   res.status(HTTPSTATUS.ok_200).send({accessToken: accessToken});
  //   return
  // }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async authMeHandler(@CurrentUser() user: UserContextDto): Promise<MeViewDto> {
    return await this.queryBus.execute<
      GetMeQuery,
      MeViewDto>(new GetMeQuery(user.userId));
  }
  // async authLogoutHandler (
  //   req: RequestWithMeta<MetaType & MetaInfoType>,
  //   res: Response) {
  //   const userId = req.meta?.userId
  //   const deviceId = req.meta?.deviceId
  //   const iat = req.meta?.iat
  //
  //   const foundUser = await this.usersQueryRepository.findUserById(userId!);
  //
  //   if (!foundUser) {
  //     res.sendStatus(HTTPSTATUS.notAuthorized_401);
  //     return
  //   }
  //
  //   const logoutResult = await this.authService.logoutUser(deviceId!);
  //   if (!logoutResult) {
  //     res.sendStatus(HTTPSTATUS.internal_error_500).send({
  //       errorsMessages: [{
  //         field: "refreshToken",
  //         message: "Smth with went wrong with logout"
  //       }]
  //     });
  //     return
  //   }
  //
  //   res.sendStatus(HTTPSTATUS.noContent_204)
  //   return
  // }
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: EmailDto): Promise<void> {
    return await this.commandBus.execute<SendRecoveryCodeCommand,void>(new SendRecoveryCodeCommand(dto));
  }
  @Post('new-password')
  async newPassword(@Body() dto: NewPasswordDto):Promise<void> {
    return await this.commandBus.execute<UpdatePasswordCommand,void>(new UpdatePasswordCommand(dto));
  }
}