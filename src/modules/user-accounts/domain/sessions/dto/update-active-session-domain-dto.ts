export class UpdateActiveSessionDomainDto {
  deviceId: string;
  iat: Date;
  exp: Date;
  private constructor(deviceId: string, iat: Date, exp: Date) {
    this.deviceId = deviceId;
    this.iat = iat;
    this.exp = exp;
  }
  static createDto(deviceId:string, iat: Date, exp: Date){
    return new UpdateActiveSessionDomainDto(deviceId, iat, exp);
  }
}