import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './config/core-config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  exports: [CqrsModule,CoreConfig],
  imports: [CqrsModule],
  providers: [CoreConfig]
})
export class CoreModule {}
