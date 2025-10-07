import { User } from '../../domain/user/user.entity';

export class MeViewDto {
  email: string;
  login: string;
  userId: string;
  static mapToView(user: User): MeViewDto {
    const dto = new MeViewDto();
    dto.email = user.email
    dto.login = user.login;
    dto.userId = user.id.toString();
    return dto;
  }
}
