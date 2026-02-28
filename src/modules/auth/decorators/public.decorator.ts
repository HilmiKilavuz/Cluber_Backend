import { SetMetadata } from '@nestjs/common';

// Metadata key used by JwtAuthGuard to detect public routes.
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks controller/method as publicly accessible (no JWT required).
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

