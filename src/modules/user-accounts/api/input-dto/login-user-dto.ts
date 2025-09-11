import { IsString } from 'class-validator';

export class LoginUserDTO {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}