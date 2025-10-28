import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { UsersRepository } from './users-repository';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async me(userId: number): Promise<MeViewDto> {
    return await this.usersQueryRepository.me(userId);
  }
}
