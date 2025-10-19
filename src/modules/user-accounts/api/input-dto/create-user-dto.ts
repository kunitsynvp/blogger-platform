import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user/constraints/user-constraints';

export class CreateUserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsEmail()
  //@Matches(emailConstraints.match)
  email: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  password: string;
}