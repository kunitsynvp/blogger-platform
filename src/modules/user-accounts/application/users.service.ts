import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserModelType } from '../domain/user/user.entity';
import { User } from '../domain/user/user.entity';
import { UsersFields } from '../domain/user/enums/users-fields';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserInputDto } from '../api/input-dto/create-user-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../config/users-accounts-config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private usersConfig: UserAccountsConfig,
  ) {}

  async createUser(dto: CreateUserInputDto, isConfirmed: boolean): Promise<string> {
    const nonUniqueFields = await this.checkLoginEmailUniqueness(
      dto.login,
      dto.email,
    );
    if (nonUniqueFields)
      throw new DomainException({
        code: DomainExceptionCode.InvalidLogin,
        message: 'loginOrEmail already exist',
        field: nonUniqueFields,
      });

    const hash = await this.cryptoService.generateHash(dto.password);

    const userForCreate = this.userModel.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash: hash,
      isConfirmed: this.usersConfig.isUserAutoConfirmed ? true : isConfirmed,
      emailConfirmationExpireInHours:
        this.usersConfig.emailConfirmationExpireInHours,
    });
    const createdUser = await this.usersRepository.save(userForCreate);
    return createdUser._id.toString();
  }

  private async checkLoginEmailUniqueness(
    login: string,
    email: string,
  ): Promise<string | null> {
    const foundUserByLogin = await this.usersRepository.findByField(
      UsersFields.Login,
      login,
    );
    if (foundUserByLogin) {
      return 'login';
    }
    const foundUserByEmail = await this.usersRepository.findByField(
      UsersFields.Email,
      email,
    );
    if (foundUserByEmail) {
      return 'email';
    }
    return null;
  }
}
