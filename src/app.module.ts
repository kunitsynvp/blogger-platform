//import of config module must be on top
import { configModule } from './core/config/dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggerPlatformModule } from './modules/blogger-platform/bloger-platform.module';
import { TestingModule } from './testing/testing.module';
import { DomainHttpExceptionsFilter } from './core/exceptions/exception-filters/domain-exceptions-filter';
import { AllHttpExceptionsFilter } from './core/exceptions/exception-filters/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    configModule,
    //mongodb+srv://admin:admin@learningcluster.qtjicyx.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster
    CoreModule,
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ""),
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
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
