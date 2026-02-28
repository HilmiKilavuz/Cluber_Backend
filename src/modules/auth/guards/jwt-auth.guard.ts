import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Global JWT authentication guard.
 *
 * Runs before protected HTTP routes and verifies access token.
 * Supports token from:
 * 1) Authorization header (Bearer)
 * 2) `access_token` cookie
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Required services for metadata reading and JWT verification.
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Main guard method called by NestJS.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // This guard is registered globally. For non-HTTP contexts (e.g., WS), skip.
    if (context.getType<'http' | 'ws'>() !== 'http') {
      return true;
    }

    // Read @Public() metadata from route handler or controller class.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public endpoints bypass token check.
    if (isPublic) {
      return true;
    }

    // Access the current Express request.
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Try extracting token from header/cookie.
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      // Verify signature + expiration.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      });

      // Attach user payload to request for downstream decorators/controllers.
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Extracts JWT token from Authorization header or cookie.
   */
  private extractToken(request: AuthenticatedRequest): string | null {
    // Header format: Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // Cookie format: access_token=<token>
    const cookieToken = (request.cookies as Record<string, unknown> | undefined)?.[
      'access_token'
    ];
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
      return cookieToken;
    }

    return null;
  }
}

