import { Injectable } from '@nestjs/common';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersFields } from '../domain/enums/users-fields';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findById(id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
    return user;
  }
  async findById(id: string): Promise<UserDocument | null> {
    return await this.UserModel.findById(id);
  }
  async findByField(
    field: UsersFields,
    value: any,
  ): Promise<UserDocument | null> {
    return await this.UserModel.findOne({ [field]: value });
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async deleteOrFail(id: string): Promise<void> {
    const deletedUser = await this.UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
  }
}
