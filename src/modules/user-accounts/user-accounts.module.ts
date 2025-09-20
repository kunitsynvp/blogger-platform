import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';
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
import { UsersExternalRepository } from './infrastructure/external/users.external.repository';
import { UsersExternalQueryRepository } from './infrastructure/external/users.external.query.repository';

const useCases = [
  //auth
  ConfirmEmailUseCase,
  LoginUseCase,
  //LogoutUseCase,
  RegistrationUseCase,
  SendRecoveryCodeUseCase,
  UpdateConfirmationCodeUseCase,
  UpdatePasswordUseCase,
  //UpdateTokensPairUseCase,
  //users
  CreateUserUseCase,
  DeleteUserUseCase,
];
const queryHandlers = [
  GetMeQueryHandler,
  GetUserByIdAndFailQueryHandler,
  GetUsersQueryHandler,
];
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
    JwtModule
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...useCases,
    ...queryHandlers,
    {
      provide: ACCESS_TOKEN_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '5m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    {
      provide: REFRESH_TOKEN_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'refresh-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '10m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    AuthQueryRepository,
    CryptoService,
    RandomService,
    UsersExternalRepository,
    UsersExternalQueryRepository
  ],
  exports: [
    UsersExternalRepository,
    UsersExternalQueryRepository
  ]
})
export class UserAccountsModule {}
