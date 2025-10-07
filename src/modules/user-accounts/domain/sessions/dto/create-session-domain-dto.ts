export class CreateSessionDomainDto {
  ip: string
  title: string
  userId: number;
  deviceId: string;
  iat: Date;
  exp: Date;
}