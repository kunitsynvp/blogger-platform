import { UserInfoDto } from '../../guards/dto/user-info-dto';

export class CreateSessionDto extends UserInfoDto {
  private constructor(ip: string,
                      title: string,
                      userId: number,
                      deviceId: string,
                      iat: Date,
                      exp: Date) {
    super(ip,title,userId, deviceId, iat,exp);
  }
  static createDto(ip: string,
                   title: string,
                   userId: number,
                   deviceId: string,
                   iat: Date,
                   exp: Date){
    return new CreateSessionDto(ip,title,userId,deviceId,iat,exp);
  }
}