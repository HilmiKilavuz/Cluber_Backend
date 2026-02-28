import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global fallback exception filter.
 *
 * This filter catches every unhandled error in HTTP layer,
 * then maps it to a consistent JSON error response shape.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Structured logger bound to this class name.
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Main filter method called by NestJS when an exception bubbles up.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    // Switch context from generic (HTTP/WS/RPC) to HTTP.
    const ctx = host.switchToHttp();

    // Native Express response object.
    const response = ctx.getResponse<Response>();

    // Native Express request object.
    const request = ctx.getRequest<Request>();

    // Determine status code: known HttpException -> own code, otherwise 500.
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine message safely for known/unknown exception types.
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // For truly unexpected errors, log full trace for diagnostics.
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Unhandled exception: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Return a standardized error payload for frontend compatibility.
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Unknown Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
