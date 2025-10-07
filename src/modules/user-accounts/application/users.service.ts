import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CreateUserInputDto } from '../api/input-dto/create-user-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../config/users-accounts-config';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';
import { User } from '../domain/user/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
    private usersConfig: UserAccountsConfig,
  ) {}

  async createUser(
    dto: CreateUserInputDto,
    isConfirmed: boolean,
  ): Promise<number> {
    const nonUniqueField = await this.checkLoginEmailUniqueness(
      dto.login,
      dto.email,
    );
    if (nonUniqueField)
      throw new DomainException({
        code: DomainExceptionCode.InvalidLogin,
        message: 'loginOrEmail already exist',
        field: nonUniqueField,
      });

    const hash = await this.cryptoService.generateHash(dto.password);

    const userForCreate = User.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash: hash,
      isConfirmed: this.usersConfig.isUserAutoConfirmed ? true : isConfirmed,
      emailConfirmationExpireInHours:
        this.usersConfig.emailConfirmationExpireInHours,
    });
    return await this.usersRepository.createUser(userForCreate);
  }

  private async checkLoginEmailUniqueness(
    login: string,
    email: string,
  ): Promise<string | null> {
    const foundUserByLogin = await this.usersRepository.findByLogin(
      login,
    );
    if (foundUserByLogin) {
      return 'login';
    }
    const foundUserByEmail = await this.usersRepository.findByEmail(
      email,
    );
    if (foundUserByEmail) {
      return 'email';
    }
    return null;
  }
}
