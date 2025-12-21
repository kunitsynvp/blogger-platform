//import of config module must be on top
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './modules/blogger-platform/bloger-platform.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
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
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { typeORMNamingStrategy } from './core/config/camel-case-naming-strategy';
import { QuizModule } from './modules/quiz/quiz.module';

@Module({
  imports: [
    configModule,
    CoreModule,
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
    // TypeOrmModule.forRoot({
    //   logging: true,
    //   namingStrategy: typeORMNamingStrategy
    // }),
    TypeOrmModule.forRootAsync({
      useFactory:(coreConfig: CoreConfig) => {
        return {
          type: coreConfig.dbType,
          host: coreConfig.dbHost,
          port: coreConfig.dbPort,
          username: coreConfig.dbUserName,
          password: coreConfig.dbUserPassword,
          database: coreConfig.dbName,
          autoLoadEntities: coreConfig.dbAutoLoadEntities,
          synchronize: coreConfig.dbSynchronize,
          logging: coreConfig.isLoggingOn,
          namingStrategy: typeORMNamingStrategy
        } as TypeOrmModuleAsyncOptions
      },
      inject: [CoreConfig]
    }),
    MailerModule.forRootAsync({
      useFactory(coreConfig: CoreConfig) {
        return {
          transport:{
            host: coreConfig.mailerHost,
            port: coreConfig.mailerPort,
            secure: coreConfig.isMailerSecure,
            auth: {
              user: coreConfig.mailerEmail,
              pass: coreConfig.mailerPassword,
            },
            tls: {
              rejectUnauthorized: coreConfig.isMailerRejectUnauthorized
            }
          }
        }
      },
      inject: [CoreConfig]
    }),
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
    NotificationsModule,
    QuizModule,
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
