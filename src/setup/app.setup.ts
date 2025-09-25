import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { cookiesSetup } from './cookies-setup';
import { CoreConfig } from '../core/config/core-config';
import { trustProxySetup } from './proxy-setting.setup';
import { NestExpressApplication } from '@nestjs/platform-express';

export function appSetup(app: NestExpressApplication) {
  const appConfig = app.get<CoreConfig>(CoreConfig);
  pipesSetup(app);
  globalPrefixSetup(app);
  if (appConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }
  trustProxySetup(app);
  cookiesSetup(app);
}
