import { UserInfoDto } from '../../guards/dto/user-info-dto';

export class CreateSessionDto extends UserInfoDto {
  private constructor(ip: string,
                      title: string,
                      userId: string,
                      deviceId: string,
                      iat: string,
                      exp: string) {
    super(ip,title,userId, deviceId, iat,exp);
  }
  static createDto(ip: string,
                   title: string,
                   userId: string,
                   deviceId: string,
                   iat: string,
                   exp: string){
    return new CreateSessionDto(ip,title,userId,deviceId,iat,exp);
  }
}