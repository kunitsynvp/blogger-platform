//import of config module must be on top
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './modules/blogger-platform/bloger-platform.module';
import { TestingModule } from './testing/testing.module';
import { DomainHttpExceptionsFilter } from './core/exceptions/exception-filters/domain-exceptions-filter';
import { AllHttpExceptionsFilter } from './core/exceptions/exception-filters/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoreModule } from './core/core.module';
import { configModule } from './config-module';
import { CoreConfig } from './core/config/core-config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    configModule,
    //mongodb+srv://admin:admin@learningcluster.qtjicyx.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster
    CoreModule,
    // MongooseModule.forRootAsync({
    //   useFactory: (coreConfig: CoreConfig) => {
    //     return {
    //       uri: coreConfig.mongodb_URI
    //     }
    //   },
    //   inject:[CoreConfig]
    // }),
    ThrottlerModule.forRootAsync(
      {
        useFactory: (coreConfig: CoreConfig) => [
          {
            ttl: coreConfig.throttlerTtlInMs,
            limit: coreConfig.throttlerLimit
          }
        ],
        inject:[CoreConfig]
      }
    ),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345',
      database: 'BloggerPlatform',
      autoLoadEntities: true,
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: "smtp.mail.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "kunitsyntest@mail.ru",
          pass: "arHCEsJhGcJmPbYf6qDv",
        },
        tls: {
          rejectUnauthorized: false,
        }
      }
    }),
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard, // Applying global throttle guard
    // },

  ],
  exports: []
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [...(coreConfig.isTestingModuleIncluded ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
