export class UserInfoDto {
  ip: string
  title: string
  userId: string;
  deviceId: string;
  iat: string;
  exp: string;
  constructor(ip: string, title: string, userId: string, deviceId: string, iat: string, exp: string) {
    this.ip = ip;
    this.title = title;
    this.userId = userId;
    this.deviceId = deviceId;
    this.iat = iat;
    this.exp = exp;
  }
}