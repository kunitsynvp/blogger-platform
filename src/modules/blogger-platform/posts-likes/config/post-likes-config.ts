import { Injectable } from '@nestjs/common';
import { IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../../../core/config/config-validation-utility';

@Injectable()
export class PostLikeConfig {
  @IsNumber({},{message: "Set env variable GET_EXTENDED_LIKES_INFO_LIKES_AMOUNT, example: 3 "})
  getExtendedLikesInfoLikesAmount: number;
  constructor(private configService: ConfigService<any,true>) {
    this.getExtendedLikesInfoLikesAmount = +this.configService.get("GET_EXTENDED_LIKES_INFO_LIKES_AMOUNT")

    configValidationUtility.validateConfig(this)
  }
}