import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users.service';
import { CryptoService } from '../../crypto.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/application/email.service';

@Injectable()
export class UpdateTokensPairUseCase {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  // async execute(
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
}