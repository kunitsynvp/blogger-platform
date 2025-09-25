import { NestExpressApplication } from '@nestjs/platform-express';

export function trustProxySetup(app: NestExpressApplication) {
  app.set('trust proxy', true);
}