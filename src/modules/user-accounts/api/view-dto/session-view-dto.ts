import { Session } from '../../domain/sessions/session.entity';

export class SessionViewDto {
  ip: string
  title: string
  lastActiveDate: string
  deviceId: string

  static mapToView(session: Session): SessionViewDto {
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.iat.toISOString(),
      deviceId: session.deviceId,
    }
  }
}