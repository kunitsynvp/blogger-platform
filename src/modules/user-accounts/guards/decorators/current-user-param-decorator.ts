import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';

export const CurrentUser = createParamDecorator((date: unknown, context: ExecutionContext):UserContextDto => {
  const ctx = context.switchToHttp()
  const request = ctx.getRequest();
  return request.user
})