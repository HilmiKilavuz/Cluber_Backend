import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Application entry point.
 *
 * What happens here, in order:
 * 1) Nest creates the root module graph from AppModule.
 * 2) Security middleware is enabled (helmet, cookie parser).
 * 3) CORS is configured so frontend can call the API.
 * 4) Global validation is enabled for every incoming DTO.
 * 5) Global exception filter is registered.
 * 6) Global route prefix is set.
 * 7) HTTP server starts listening on configured port.
 */
async function bootstrap(): Promise<void> {
  // Create the NestJS application instance from the root module.
  const app = await NestFactory.create(AppModule);

  // Read environment variables via Nest ConfigService.
  const configService = app.get(ConfigService);

  // Create a named logger for startup logs.
  const logger = new Logger('Bootstrap');

  // Adds secure HTTP headers (XSS, clickjacking, etc.).
  app.use(helmet());

  // Parses cookies from incoming requests into request.cookies.
  app.use(cookieParser());

  // Configure cross-origin rules for browser-based clients.
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Validate and sanitize request DTOs globally.
  app.useGlobalPipes(
    new ValidationPipe({
      // Remove unknown properties that are not in DTO.
      whitelist: true,

      // Throw error if unknown properties are provided.
      forbidNonWhitelisted: true,

      // Convert payload primitives to expected DTO types when possible.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Catch all unhandled errors in one standardized place.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Prefix every route with /api/v1.
  app.setGlobalPrefix('api/v1');

  // Read application port from environment (fallback: 3000).
  const port = configService.get<number>('APP_PORT', 3000);

  // Start listening for HTTP requests.
  await app.listen(port);

  // Startup logs for visibility in terminal/container logs.
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📦 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap();
