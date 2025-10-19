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

  @IsString({message: 'Set env variable DB_TYPE, example: postgres'})
  dbType: string

  @IsString({message: 'Set env variable DB_HOST, example: localhost'})
  dbHost: string

  @IsNumber({},{message: 'Set env variable DB_ORT, example: 5432'})
  dbPort: number

  @IsString({message: 'Set env variable DB_USERNAME, example: postgres'})
  dbUserName: string

  @IsString({message: 'Set env variable DB_USER_PASSWORD, example: 12345'})
  dbUserPassword: string

  @IsString({message: 'Set env variable DB_NAME, example: BloggerPlatform'})
  dbName: string

  @IsBoolean({message: 'Set env variable DB_IS_AUTO_LOAD_ENTITIES, example: true'})
  dbAutoLoadEntities: boolean

  @IsBoolean({message: 'Set env variable DB_IS_SYNCHRONIZE, example: true'})
  dbSynchronize: boolean


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
    this.dbType = this.configService.get('DB_TYPE');
    this.dbHost = this.configService.get('DB_HOST');
    this.dbPort = +this.configService.get('DB_PORT');
    this.dbUserName = this.configService.get('DB_USERNAME');
    this.dbUserPassword = this.configService.get('DB_USER_PASSWORD');
    this.dbName = this.configService.get('DB_NAME');
    this.dbAutoLoadEntities = configValidationUtility.convertToBoolean(
      this.configService.get('DB_IS_AUTO_LOAD_ENTITIES')) as boolean
    this.dbSynchronize = configValidationUtility.convertToBoolean(
      this.configService.get('DB_IS_SYNCHRONIZE')) as boolean

    configValidationUtility.validateConfig(this);
  }
}
