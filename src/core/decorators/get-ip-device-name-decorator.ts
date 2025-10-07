import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfoDto } from '../../modules/user-accounts/guards/dto/user-info-dto';

export const GetIpAndDeviceName = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userIp =
      (request.headers['x-forwarded-for'] as string) || '192.168.0.1';

    const deviceName = (request.headers['user-agent'] ||
      'Other device') as string;

    return {
      ip: userIp,
      title: deviceName,
    } as UserInfoDto;
  },
);