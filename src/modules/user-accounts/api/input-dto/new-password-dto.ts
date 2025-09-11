import { IsUUID } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { passwordConstraints } from '../../domain/constraints/user-constraints';

export class NewPasswordDto  {
  @IsStringWithTrim(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string
  @IsUUID()
  recoveryCode: string
}