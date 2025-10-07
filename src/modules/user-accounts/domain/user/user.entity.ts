import {
  CreateUserDomainDto,
  EmailConfirmationUserDomainDto,
  PasswordRecoveryUserDomainDto,
} from './dto/user-domain-dto';
import { RandomService } from '../../application/random.service';
import {
  emailConstraints,
  loginConstraints,
} from './constraints/user-constraints';
import { add } from 'date-fns';

export class User {
  id: number;
  login: string;
  passwordHash: string;
  email: string;
  confirmationCode: string | null
  confirmationExpDate: Date | null
  isConfirmed: boolean;
  recoveryCode: string | null
  recoveryExpDate: Date | null
  createdAt: Date;

  static createUser(dto: CreateUserDomainDto): User {
    const user = new User();
    user.checkUsersExceptions(dto);

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.confirmationCode = null;
    user.confirmationExpDate = null;
    user.isConfirmed = dto.isConfirmed;

    if (!dto.isConfirmed) {
      user.confirmationCode = RandomService.createUuid();
      user.confirmationExpDate= add(new Date(), {
        hours: dto.emailConfirmationExpireInHours,
      });
    }
    user.recoveryCode = null;
    user.recoveryExpDate = null;
    user.createdAt = new Date();

    return user
  }

  confirmEmail() {
    if (this.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    if (!this.confirmationExpDate) {
      throw new Error('This confirmation code is expired');
    }
    if (this.confirmationExpDate < new Date()) {
      throw new Error('This confirmation code is expired');
    }
    this.isConfirmed = true;
  }
  updatePassword(newPasswordHash: string) {
    if (!this.recoveryExpDate) {
      throw new Error('This recoveryCode is expired');
    }

    if (this.recoveryExpDate < new Date()) {
      throw new Error('This recoveryCode is expired');
    }

    this.passwordHash = newPasswordHash;
  }
  setPasswordRecovery(dto: PasswordRecoveryUserDomainDto) {
    if (dto.expirationDate < new Date()) {
      throw new Error('Invalid password recovery expiration date');
    }

    this.recoveryExpDate = dto.expirationDate;
    this.recoveryCode = dto.recoveryCode;
  }
  updateConfirmation(dto: EmailConfirmationUserDomainDto) {
    if (this.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    this.confirmationCode = dto.confirmationCode;
    this.confirmationExpDate = dto.expirationDate;
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
  confirmationCode: string | null
  confirmationExpDate: Date | null
  isConfirmed: boolean;
  recoveryCode: string | null
  recoveryExpDate: Date | null
  createdAt: Date;
};
export class EmailConfirmation  {
  id: number;
  expirationDate: Date | null;
  confirmationCode: string | null;
  isConfirmed: boolean;
  userId: number;
}
export type EmailConfirmationDbType = {
  id: number;
  expirationDate: Date | null;
  confirmationCode: string | null;
  isConfirmed: boolean;
  userId: number;
}
export class PasswordRecovery {
  id: number;
  recoveryCode: string | null;
  expirationDate: Date | null;
  userId: number;
}
export type PasswordRecoveryDbType = {
  id: number;
  recoveryCode: string | null;
  expirationDate: Date | null;
  userId: number;
}
