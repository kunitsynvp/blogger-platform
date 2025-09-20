import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users.service';
import { CryptoService } from '../../crypto.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/application/email.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  // async execute(deviceId: string): Promise<boolean> {
  //   return await this.securityDevicesService.deleteSpecifiedActiveSession(
  //     deviceId,
  //   );
  // }
}