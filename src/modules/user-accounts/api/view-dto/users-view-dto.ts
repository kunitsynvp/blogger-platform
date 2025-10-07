import { User } from '../../domain/user/user.entity';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string
  static mapToView(user: User): UsersViewDto {
    const dto = new UsersViewDto();
    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString()

    return dto;
  }
}
