import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { UsersSqlRepository } from './users.sql.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersSqlRepository) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersRepository.findByIdOrFail(userId);
    return MeViewDto.mapToView(user);
  }
}
