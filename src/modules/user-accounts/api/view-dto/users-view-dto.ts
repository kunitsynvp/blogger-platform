import { UserDocument } from '../../domain/user/user.entity';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  static mapToView(user: UserDocument): UsersViewDto {
    const dto = new UsersViewDto();
    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }
}
