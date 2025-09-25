import { Injectable } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../../core/config/config-validation-utility';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string

  @IsNumber({},{message: "Set Env variable EMAIL_CONFIRMATION_EXPIRE_IN_HOURS, examples: 1,5,20"})
  emailConfirmationExpireInHours:number

  @IsBoolean({message: "Set Env IS_USER_AUTO_CONFIRMED, dangerous for security!, example : false"})
  isUserAutoConfirmed: boolean

  constructor(private configService: ConfigService<any, true>) {
    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get('REFRESH_TOKEN_EXPIRE_IN',)
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.emailConfirmationExpireInHours = +this.configService.get('EMAIL_CONFIRMATION_EXPIRE_IN_HOURS');
    this.isUserAutoConfirmed = configValidationUtility.convertToBoolean(
      this.configService.get("IS_USER_AUTO_CONFIRMED")
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}