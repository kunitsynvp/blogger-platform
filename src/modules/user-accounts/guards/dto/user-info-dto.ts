export class UserInfoDto {
  ip: string
  title: string
  userId: number;
  deviceId: string;
  iat: Date;
  exp: Date;
  constructor(ip: string, title: string, userId: number, deviceId: string, iat: Date, exp:Date) {
    this.ip = ip;
    this.title = title;
    this.userId = userId;
    this.deviceId = deviceId;
    this.iat = iat;
    this.exp = exp;
  }
}