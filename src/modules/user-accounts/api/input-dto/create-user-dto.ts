import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { Trim } from '../../../../core/decorators/transformation/trim-decorator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/constraints/user-constraints';

export class CreateUserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  @IsNotEmpty()
  login: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @Matches(emailConstraints.match)
  email: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  @IsNotEmpty()
  password: string;
}