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
 * Standardized error payload returned to clients.
 */
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Handles only HttpException instances.
 *
 * Why separate this from all-exceptions filter?
 * - HttpException already contains known HTTP details.
 * - We can preserve validation/business error messages safely.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger scoped to this class.
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Converts Nest HttpException into consistent JSON output.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    // Switch from generic execution context to HTTP context.
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP status attached to exception (e.g., 400, 401, 404).
    const status = exception.getStatus();

    // Can be string or object depending on where exception came from.
    const exceptionResponse = exception.getResponse();

    // Safely extract useful message for client.
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as Record<string, unknown>).message
        : exception.message;

    // Build final API error response body.
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: message as string | string[],
      error: HttpStatus[status] || 'Unknown Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log severity based on status family.
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${JSON.stringify(message)}`,
      );
    }

    // Send formatted response.
    response.status(status).json(errorResponse);
  }
}
