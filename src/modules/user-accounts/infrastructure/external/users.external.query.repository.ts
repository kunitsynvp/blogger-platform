import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UsersViewDto } from '../../api/view-dto/users-view-dto';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

  async findByIdOrFail(id: string): Promise<UsersViewDto> {
    const foundUser = await this.userModel.findById(id);

    if (!foundUser) {
      throw new DomainException({
        message: 'User not found',
        code: DomainExceptionCode.NotFound,
        field: "userId"
      });
    }
    return UsersViewDto.mapToView(foundUser);
  }
}
