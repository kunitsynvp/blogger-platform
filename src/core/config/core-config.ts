import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { configValidationUtility } from './config-validation-utility';

export enum Environments  {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set env variable PORT, example: 3000' })
  port: number;
  @IsString({
    message:
      "Set env variable MONGODB_URI,example: 'mongodb://localhost:27017'",
  })
  @Matches(/^mongodb(?:\+srv)?:\/\//, {
    message: 'MONGODB_URI must start with "mongodb://" or "mongodb+srv://"',
  })
  mongodb_URI: string
  @IsEnum(Environments)
  env:string

  @IsBoolean({message: "Set env variable IS_SWAGGER_ENABLED, example: false"})
  isSwaggerEnabled: boolean

  @IsBoolean({message:"Set env variable IS_TESTING_MODULE_INCLUDED, example: false"})
  isTestingModuleIncluded: boolean

  @IsNumber({}, {message: "Set env variable THROTTLER_TTL_IN_MS, example: 10000"})
  throttlerTtlInMs: number

  @IsNumber({}, {message: "Set env variable THROTTLER_LIMIT, example: 5"})
  throttlerLimit: number

  constructor(private configService: ConfigService<any, true>) {
    this.port = +this.configService.get('PORT');
    this.mongodb_URI = this.configService.get('MONGODB_URI');
    this.env = this.configService.get('NODE_ENV');
    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED')
    ) as boolean;
    this.isTestingModuleIncluded = configValidationUtility.convertToBoolean(
      this.configService.get('IS_TESTING_MODULE_INCLUDED')
    ) as boolean;
    this.throttlerTtlInMs = +this.configService.get('THROTTLER_TTL_IN_MS');
    this.throttlerLimit = +this.configService.get('THROTTLER_LIMIT');
    configValidationUtility.validateConfig(this);
  }
}
