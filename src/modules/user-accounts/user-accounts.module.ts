import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { RandomService } from './application/random.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CryptoService } from './application/crypto.service';
import { AuthController } from './api/auth.controller';
import { AuthQueryRepository } from './infrastructure/auth.query.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConfirmEmailUseCase } from './application/use-cases/auth/confirm-email-use-case';
import { LoginUseCase } from './application/use-cases/auth/login-use-case';
import { RegistrationUseCase } from './application/use-cases/auth/registration-use-case';
import { SendRecoveryCodeUseCase } from './application/use-cases/auth/send-recovery-code-use-case';
import { UpdateConfirmationCodeUseCase } from './application/use-cases/auth/update-confirmation-code-use-case';
import { UpdatePasswordUseCase } from './application/use-cases/auth/update-password-use-case';
import { CreateUserUseCase } from './application/use-cases/users/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/users/delete-user-use-case';
import { GetMeQueryHandler } from './application/queries/auth/get-me-query';
import { GetUserByIdAndFailQueryHandler } from './application/queries/users/get-user-by-id-or-fail-query';
import { GetUsersQueryHandler } from './application/queries/users/get-users-query';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from './constants/jwt-tokens-inject-constants';
import { UserAccountsConfig } from './config/users-accounts-config';
import { TerminateSpecifiedSessionUseCase } from './application/use-cases/session/terminate-specified-sessions-use-case';
import { TerminateAllSessionsUseCase } from './application/use-cases/session/terminate-all-sessions-use-case';
import { GetSessionsQueryHandler } from './application/queries/sessions/get-sessions-query';
import { SessionsController } from './api/sessions.controller';
import { UpdateTokensPairUseCase } from './application/use-cases/auth/update-tokens-pair-use-case';
import { LogoutUseCase } from './application/use-cases/auth/logout-use-case';
import { SessionsService } from './application/sessions.service';
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';
import { SessionsSqlQueryRepository } from './infrastructure/sessions/sessions-sql-query-repository';
import { SessionsSqlRepository } from './infrastructure/sessions/sessions-sql-repository';
import { UsersExternalSqlRepository } from './infrastructure/external/users.external.sql.repository';

const useCases = [
  //auth
  ConfirmEmailUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegistrationUseCase,
  SendRecoveryCodeUseCase,
  UpdateConfirmationCodeUseCase,
  UpdatePasswordUseCase,
  UpdateTokensPairUseCase,
  //users
  CreateUserUseCase,
  DeleteUserUseCase,
  //sessions
  TerminateSpecifiedSessionUseCase,
  TerminateAllSessionsUseCase,
];
const queryHandlers = [
  GetMeQueryHandler,
  GetUserByIdAndFailQueryHandler,
  GetUsersQueryHandler,
  GetSessionsQueryHandler,
];
@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: UserMongoose.name, schema: UserSchema },
    // ]),
    NotificationsModule,
    JwtModule,
  ],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    UserAccountsConfig,
    ...useCases,
    ...queryHandlers,
    {
      provide: ACCESS_TOKEN_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.accessTokenSecret,
          signOptions: { expiresIn: config.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: { expiresIn: config.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    UsersService,
    UsersSqlQueryRepository,
    AuthQueryRepository,
    CryptoService,
    RandomService,
    UsersExternalSqlRepository,
    //UsersExternalQueryRepository,//TODO DO SQL LOGIC FOR THIS QUERY REPO IF NEEDED
    SessionsService,
    UsersSqlRepository,
    SessionsSqlQueryRepository,
    SessionsSqlRepository,
  ],
  exports: [
    UsersExternalSqlRepository,
    //UsersExternalQueryRepository,
    UserAccountsConfig,
  ],
})
export class UserAccountsModule {}
