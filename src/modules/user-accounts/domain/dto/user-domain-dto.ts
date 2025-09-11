export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;

}
export class CreateUserDomainOptions  {
  createBySA?: boolean = false;
}

export class PasswordRecoveryUserDomainDto {
  recoveryCode: string;
  expirationDate: Date;
}
export class EmailConfirmationUserDomainDto {
  confirmationCode: string;
  expirationDate: Date;
}
