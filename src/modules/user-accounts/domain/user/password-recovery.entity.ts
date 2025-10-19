import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PasswordRecoveryUserDomainDto } from './dto/user-domain-dto';

@Entity()
export class PasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    type: 'timestamp without time zone',
  })
  expirationDate: Date | null;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 50,
  })
  recoveryCode: string | null;

  @OneToOne(() => User, user => user.passwordRecovery)
  @JoinColumn()
  user: User;
  @Column({ type: 'int' })
  userId: number;

  static create(userId: number): PasswordRecovery {
    const passwordRecovery = new PasswordRecovery();
    passwordRecovery.expirationDate = null
    passwordRecovery.recoveryCode = null
    passwordRecovery.userId = userId
    return passwordRecovery;
  }
  setPasswordRecovery(dto: PasswordRecoveryUserDomainDto) {
    if (dto.expirationDate < new Date()) {
      throw new Error('Invalid password recovery expiration date');
    }

    this.expirationDate = dto.expirationDate;
    this.recoveryCode = dto.recoveryCode;
  }

}
