import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { UsersService } from '../application/users.service';
import { LoginUserDTO } from './input-dto/login-user-dto';
import { AuthService } from '../application/auth.service';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { ConfirmationCodeDto } from './input-dto/confirmation-code-dto';
import { EmailDto } from './input-dto/email-dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth-guard';
import { CurrentUser } from '../guards/decorators/current-user-param-decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/me-view-dto';
import { AuthQueryRepository } from '../infrastructure/auth.query.repository';
import { NewPasswordDto } from './input-dto/new-password-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDTO): Promise<{ accessToken: string }> {
    return await this.authService.login(dto);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: CreateUserInputDto): Promise<void> {
    return await this.authService.registration(dto);
  }
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() dto: ConfirmationCodeDto,
  ): Promise<void> {
    return await this.authService.confirmEmail(dto);
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() dto: EmailDto)
    : Promise<void> {
    return await this.authService.updateConfirmationCode(dto);
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
    return await this.authQueryRepository.me(user.userId);
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

    return await this.authService.sendRecoveryPassword(dto)

  }
  @Post('new-password')
  async newPassword(@Body() dto: NewPasswordDto){
    return await this.authService.updatePassword(dto)
  }
}