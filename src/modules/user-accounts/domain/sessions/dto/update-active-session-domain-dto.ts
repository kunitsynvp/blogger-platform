export class UpdateActiveSessionDomainDto {
  deviceId: string;
  iat: string;
  exp: string;
  private constructor(deviceId: string, iat: string, exp: string) {
    this.deviceId = deviceId;
    this.iat = iat;
    this.exp = exp;
  }
  static createDto(deviceId:string, iat: string, exp: string){
    return new UpdateActiveSessionDomainDto(deviceId, iat, exp);
  }
}