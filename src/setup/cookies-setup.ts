import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

export function cookiesSetup(app: NestExpressApplication) {
  //специальный метод, который применяет глобально cookieParser
  app.use(cookieParser());
}