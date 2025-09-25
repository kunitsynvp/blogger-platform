import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/config/core-config';
import { initAppModule } from './init-app-module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create<NestExpressApplication>(DynamicAppModule);
  appSetup(app)

  const coreConfig = app.get<CoreConfig>(CoreConfig)
  await app.listen(coreConfig.port , () => {
    console.log('App starting listen port: ', coreConfig.port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();
