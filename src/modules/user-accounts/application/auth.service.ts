import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { CryptoService } from './crypto.service';
import { LoginUserDTO } from '../api/input-dto/login-user-dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserInputDto } from '../api/input-dto/create-user-dto';
import { UsersService } from './users.service';
import { EmailService } from '../../notifications/application/email.service';
import { UsersFields } from '../domain/enums/users-fields';
import { ConfirmationCodeDto } from '../api/input-dto/confirmation-code-dto';
import { EmailDto } from '../api/input-dto/email-dto';
import { RandomService } from './random.service';
import { add } from 'date-fns';
import {
  EmailConfirmationUserDomainDto,
  PasswordRecoveryUserDomainDto,
} from '../domain/dto/user-domain-dto';
import { NewPasswordDto } from '../api/input-dto/new-password-dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginUserDTO): Promise<{ accessToken: string }> {
    const loggedInUser: UserDocument = await this.checkCredentials(dto);

    const accessToken = this.jwtService.sign({
      userId: loggedInUser._id.toString(),
    });

    return { accessToken: accessToken };
  }

  // async logout(deviceId: string): Promise<boolean> {
  //   return await this.securityDevicesService.deleteSpecifiedActiveSession(
  //     deviceId,
  //   );
  // }

  async registration(dto: CreateUserInputDto): Promise<void> {
    const createdUserId = await this.usersService.createUser(dto);

    const foundUser = await this.usersRepository.findById(createdUserId);

    try {
      this.emailService.sendConfirmationCode(foundUser as UserDocument);
    } catch (e) {
      console.error(e);
    }
  }

  async confirmEmail(dto: ConfirmationCodeDto): Promise<void> {
    const user: UserDocument | null = await this.usersRepository.findByField(
      UsersFields.EmailConfirmationConfCode,
      dto.code,
    );
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeNotFound,
        message: 'confirmationCode does not exist',
        field: "code"
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: "code"
      });
    }
    if (!user.emailConfirmation.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: "code"
      });
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: "code"
      });
    }

    user.confirmEmail();

    await this.usersRepository.save(user);
  }
  async updatePassword(dto: NewPasswordDto): Promise<void> {
    const foundUser: UserDocument | null =
      await this.usersRepository.findByField(
        UsersFields.PasswordRecoveryRecCode,
        dto.recoveryCode,
      );
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery does not exist',
        field: "recoveryCode"
      });
    }

    if (!foundUser.passwordRecovery.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: "recoveryCode"
      });
    }

    if (foundUser.passwordRecovery.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: "recoveryCode"
      });
    }

    const newHashPassword = await this.cryptoService.generateHash(dto.newPassword);
    foundUser.updatePassword(newHashPassword);
    await this.usersRepository.save(foundUser);

    return
  }

  async sendRecoveryPassword(dto: EmailDto): Promise<void> {
    const foundUser = await this.usersRepository.findByField(
      UsersFields.Email,
      dto.email,
    );

    if (!foundUser) {
      return;
    }
    const passwordRecoveryDto: PasswordRecoveryUserDomainDto = {
      recoveryCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { minutes: 10 }),
    };

    foundUser.setPasswordRecovery(passwordRecoveryDto);

    const updatedUser = await this.usersRepository.save(foundUser);

    try {
      this.emailService.sendRecoveryCode(updatedUser);
    } catch (e) {
      console.error(e);
    }
    return;
  }

  async updateConfirmationCode(dto: EmailDto): Promise<void> {
    const foundUser = await this.usersRepository.findByField(
      UsersFields.Email,
      dto.email,
    );
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email doesnt exist',
        field: 'email'
      });
    }
    if (foundUser.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: "email"
      });
    }
    const emailConfirmationDto: EmailConfirmationUserDomainDto = {
      confirmationCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    foundUser.updateConfirmation(emailConfirmationDto);

    const updatedUser = await this.usersRepository.save(foundUser);
    this.emailService.sendConfirmationCode(updatedUser);
  }
  // async updateTokensPair(
  //   userId: string,
  //   deviceId: string,
  // ): Promise<AccessAndRefreshTokenType | null> {
  //   const foundUser: UserDocument | null =
  //     await this.usersRepository.findUserById(userId);
  //
  //   if (!foundUser) {
  //     return null;
  //   }
  //
  //   const newAccessToken = await this.jwtService.updateAccessToken(
  //     userId,
  //     deviceId,
  //   );
  //   const newRefreshToken = await this.jwtService.updateRefreshToken(
  //     userId,
  //     deviceId,
  //   );
  //
  //   const dataFromNewRefreshToken: JWTPayloadType =
  //     await this.jwtService.extractPayloadDataFromJWT(newRefreshToken);
  //   const { iat, exp } = dataFromNewRefreshToken;
  //
  //   const updateSessionResult =
  //     await this.securityDevicesService.updateActiveSession(deviceId, iat, exp);
  //   return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  // }

  private async checkCredentials(dto: LoginUserDTO): Promise<UserDocument> {
    const foundUser: UserDocument | null =
      await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);

    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
        field: "none"
      });
    }
    const isPasswordsEqual = await this.cryptoService.comparePassword(
      dto.password,
      foundUser.passwordHash,
    );
    if (!isPasswordsEqual) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
        field: "none"
      });
    }
    return foundUser;
  }
}