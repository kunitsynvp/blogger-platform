import { NestExpressApplication } from '@nestjs/platform-express';

export const GLOBAL_PREFIX = '/';

export function globalPrefixSetup(app: NestExpressApplication) {
  //специальный метод, который добавляет ко всем маршрутам /GLOBAL_PREFIX
  app.setGlobalPrefix(GLOBAL_PREFIX);
}
