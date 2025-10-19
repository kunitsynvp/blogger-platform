import { CreateSessionDomainDto } from './dto/create-session-domain-dto';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number

  @Column({type: 'varchar', length: 30})
  ip: string;

  @Column({type: 'varchar', length: 30})
  title: string;

  @Column({type: 'varchar', length: 50})
  deviceId: string;

  @Column({type: 'int'})
  userId: number;

  @Column({type: 'timestamp without time zone'})
  iat: Date;

  @Column({type: 'timestamp without time zone'})
  exp: Date;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User

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