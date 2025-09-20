import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export function cookiesSetup(app: INestApplication) {
  //специальный метод, который применяет глобально cookieParser
  app.use(cookieParser());
}