import { LoginUserDto } from '../../api/input-dto/login-user-dto';

export class LoginUserCommandDto extends LoginUserDto{
  ip:string
  title: string
  private constructor(loginOrEmail: string, password: string, ip: string, title: string) {
    super(loginOrEmail, password);
    this.ip = ip;
    this.title = title;
  }
  static createDto(loginOrEmail: string, password: string, ip: string, title: string) {
    return new LoginUserCommandDto(loginOrEmail, password, ip, title);
  }
}