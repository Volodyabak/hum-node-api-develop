import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ResponseContext {
  userId: string;
  accessToken: string;
}

export const ResCtx = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const response = ctx.switchToHttp().getResponse();
  return response.locals;
});
