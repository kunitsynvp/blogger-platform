import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
  CreateEmailConfirmationDomainDto,
  EmailConfirmationUserDomainDto,
} from './dto/user-domain-dto';
import { add } from 'date-fns';
import { RandomService } from '../../application/random.service';

@Entity()
export class EmailConfirmation {
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
  confirmationCode: string | null;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  user: User;
  @Column({ type: 'int' })
  userId: number;

  static create(dto: CreateEmailConfirmationDomainDto): EmailConfirmation {
    const emailConf = new EmailConfirmation();

    emailConf.confirmationCode = null;
    emailConf.expirationDate = null;
    emailConf.isConfirmed = dto.isConfirmed;
    emailConf.userId = dto.userId;

    if (!dto.isConfirmed) {
      emailConf.confirmationCode = RandomService.createUuid();
      emailConf.expirationDate = add(new Date(), {
        hours: dto.emailConfirmationExpireInHours,
      });
    }

    return emailConf;
  }
  confirmEmail() {
    if (this.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    if (!this.expirationDate) {
      throw new Error('This confirmation code is expired');
    }
    if (this.expirationDate < new Date()) {
      throw new Error('This confirmation code is expired');
    }
    this.isConfirmed = true;
  }
  updateConfirmation(dto: EmailConfirmationUserDomainDto) {
    if (this.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    this.confirmationCode = dto.confirmationCode;
    this.expirationDate = dto.expirationDate;
  }
}