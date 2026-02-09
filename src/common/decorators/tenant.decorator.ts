import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantInfo } from '../middleware/tenant.middleware';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant || { subdomain: null, isMainDomain: true };
  },
);
