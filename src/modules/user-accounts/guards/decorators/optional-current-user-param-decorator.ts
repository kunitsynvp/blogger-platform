import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';

export const OptionalCurrentUser = createParamDecorator((date: unknown, context: ExecutionContext):UserContextDto | undefined => {
  const ctx = context.switchToHttp()
  const request = ctx.getRequest();
  return request?.user
})