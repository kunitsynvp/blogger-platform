import { CreateUserDomainDto } from './dto/user-domain-dto';
import {
  emailConstraints,
  loginConstraints,
} from './constraints/user-constraints';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation.entity';
import { Session } from '../sessions/session.entity';
import { PasswordRecovery } from './password-recovery.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'character varying',
    collation: 'C',
    unique: true,
    length: 50,
  })
  login: string;

  @Column({
    type: 'character varying',
    length: 200,
  })
  passwordHash: string;

  @Column({
    type: 'character varying',
    length: 150,
    unique: true,
    collation: 'C',
  })
  email: string;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user)
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pc) => pc.user)
  passwordRecovery: PasswordRecovery;

  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[];

  static createUser(dto: CreateUserDomainDto): User {
    const user = new User();
    user.checkUsersExceptions(dto);

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();

    return user;
  }
  updatePassword(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
  }

  checkUsersExceptions(dto: CreateUserDomainDto) {
    if (
      dto.login.length > loginConstraints.maxLength ||
      dto.login.length < loginConstraints.minLength ||
      !loginConstraints.match.test(dto.login)
    ) {
      throw new Error('invalid login');
    }
    if (!emailConstraints.match.test(dto.email)) {
      throw new Error('invalid email');
    }
  }
}

export type UserDbType = {
  id: number;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
};
export type UserCompoundDbType = {
  id: number;
  login: string;
  passwordHash: string;
  email: string;
  confirmationCode: string | null;
  confirmationExpDate: Date | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  recoveryExpDate: Date | null;
  createdAt: Date;
};
