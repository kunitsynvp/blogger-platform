import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../modules/user-accounts/guards/dto/user-context.dto';
import { UserInfoDto } from '../../modules/user-accounts/guards/dto/user-info-dto';

export const GetUserInfo = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userIp = request.headers['x-forwarded-for'] as string || "192.168.0.1";

    const deviceName = (request.headers['user-agent'] ||
      'Other device') as string;

    const user = request.user as UserContextDto;
    return {
      ip: userIp,
      title: deviceName,
      userId: user.userId,
      deviceId: user.deviceId,
      iat: user.iat,
      exp: user.exp,
    } as UserInfoDto
  },
);