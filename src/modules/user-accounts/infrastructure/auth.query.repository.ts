import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { UsersRepository } from './users-repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersRepository.findByIdOrFail(userId);
    return MeViewDto.mapToView(user);
  }
}
