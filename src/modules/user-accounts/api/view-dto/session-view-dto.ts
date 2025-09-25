import { SessionDocument } from '../../domain/sessions/session.entity';

export class SessionViewDto {
  ip: string
  title: string
  lastActiveDate: string
  deviceId: string

  static mapToView(session: SessionDocument) {
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    }
  }
}