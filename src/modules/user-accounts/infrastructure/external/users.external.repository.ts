import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import type { UserModelType } from '../../domain/user/user.entity';
import { User, UserDocument } from '../../domain/user/user.entity';

@Injectable()
export class UsersExternalRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const foundUser = await this.userModel.findById(id);

    if (!foundUser) {
      throw new DomainException({
        message: 'User not found',
        code: DomainExceptionCode.NotFound,
        field: 'userId',
      });
    }
    return foundUser;
  }
}
