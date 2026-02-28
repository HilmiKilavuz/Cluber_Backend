import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Express request extension used in authenticated routes.
 *
 * JwtAuthGuard injects verified payload into `user` field.
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

