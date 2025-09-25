//если специфических кодов будет много лучше разнести их в соответствующие модули
export enum DomainExceptionCode {
  //common
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,
  ValidationEnvError = 6,
  TooManyRequests = 7,
  //auth
  Unauthorized = 11,
  EmailAlreadyConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
  InvalidLogin = 15,
  InvalidPassword = 16,
  ConfirmationCodeNotFound = 17,


}
