import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersQueryDto } from '../api/input-dto/users-query-dto';
import { UsersViewDto } from '../api/view-dto/users-view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { User } from '../domain/user/user.entity';
import type { UserModelType } from '../domain/user/user.entity';
import { MeViewDto } from '../api/view-dto/me-view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}
  async findAllUsers(query: UsersQueryDto,)
    : Promise<PaginatedViewDto<UsersViewDto[]>> {
    const filter: FilterQuery<User> = {};

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.userModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.userModel.countDocuments(filter);

    const items = users.map(UsersViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
  async findByIdOrFail(id: string): Promise<UsersViewDto> {
    const foundUser = await this.userModel.findById(id)

    if(!foundUser) {
      throw new NotFoundException("User not found");
    }
    return UsersViewDto.mapToView(foundUser);
  }
  async me(id: string): Promise<MeViewDto> {
    const foundUser = await this.userModel.findById(id)
    if(!foundUser) {
      throw new NotFoundException("User not found");
    }
    return MeViewDto.mapToView(foundUser)
  }
}
