import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((date: unknown, context: ExecutionContext) => {
  const ctx = context.switchToHttp()
  const request = ctx.getRequest();
  return request.user
})