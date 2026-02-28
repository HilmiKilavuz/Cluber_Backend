import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Custom parameter decorator to access authenticated user payload.
 *
 * Usage in controller:
 * `method(@CurrentUser() user: JwtPayload) { ... }`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    // Access current HTTP request.
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    // JwtAuthGuard writes payload into request.user after verification.
    return request.user;
  },
);

