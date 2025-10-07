import { CreateSessionDomainDto } from './dto/create-session-domain-dto';

export class Session {
  id: number
  ip: string;
  title: string;
  deviceId: string;
  userId: number;
  iat: Date;
  exp: Date;

  static createSession(dto: CreateSessionDomainDto): Session {
    const session = new Session();

    session.ip = dto.ip;
    session.title = dto.title;
    session.userId = dto.userId
    session.deviceId = dto.deviceId;
    session.iat = dto.iat;
    session.exp = dto.exp;

    return session
  }
  updateActiveSession(newIat: Date, newExp: Date) {
    this.iat = newIat;
    this.exp = newExp;
  }
}