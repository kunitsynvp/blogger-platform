export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;
  isConfirmed: boolean
  emailConfirmationExpireInHours: number

}
export class PasswordRecoveryUserDomainDto {
  recoveryCode: string;
  expirationDate: Date;
}
export class EmailConfirmationUserDomainDto {
  confirmationCode: string;
  expirationDate: Date;
}
