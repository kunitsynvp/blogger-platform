import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
  constructor(loginOrEmail: string, password: string) {
    this.loginOrEmail = loginOrEmail;
    this.password = password;
  }
}