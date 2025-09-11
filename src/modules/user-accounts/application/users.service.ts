import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import { UsersFields } from '../domain/enums/users-fields';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserInputDto } from '../api/input-dto/create-user-dto';
import { CreateUserDomainOptions } from '../domain/dto/user-domain-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdOrFail(id);
  }
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.usersRepository.findByLoginOrEmail(loginOrEmail);
  }
  async createUser(
    dto: CreateUserInputDto,
    options?: CreateUserDomainOptions,
  ): Promise<string> {
    const nonUniqueFields = await this.checkLoginEmailUniqueness(
      dto.login,
      dto.email,
    ); //TODO: use nonUniqueFields
    if (nonUniqueFields)
      throw new DomainException({
        code: DomainExceptionCode.InvalidLogin,
        message: "loginOrEmail already exist",
        field: nonUniqueFields
      });

    const hash = await this.cryptoService.generateHash(dto.password);
    let UserForCreate: UserDocument;

    if (options) {
      UserForCreate = this.userModel.createUser(
        {
          login: dto.login,
          email: dto.email,
          passwordHash: hash,
        },
        options,
      );
    } else {
      UserForCreate = this.userModel.createUser({
        login: dto.login,
        email: dto.email,
        passwordHash: hash,
      });
    }

    const createdUser = await this.usersRepository.save(UserForCreate);
    return createdUser._id.toString();
  }

  async deleteUser(id: string): Promise<void> {
    return await this.usersRepository.deleteOrFail(id);
  }
  private async checkLoginEmailUniqueness(
    login: string,
    email: string,
  ): Promise<string | null> {
    const foundUserByLogin = await this.usersRepository.findByField(
      UsersFields.Login,
      login,
    );
    if (foundUserByLogin){
      return "login"
    }
    const foundUserByEmail = await this.usersRepository.findByField(
      UsersFields.Email,
      email,
    );
    if (foundUserByEmail){
      return "email"
    }
    return null;
  }
}
