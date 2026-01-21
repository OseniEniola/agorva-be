// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // Handle HTTP exceptions (thrown by you)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    } 
    // Handle validation errors (class-validator)
    else if (exception instanceof Error && exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errors = exception.message;
    }
    // Handle database errors
    else if (exception instanceof Error && exception.name === 'QueryFailedError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      // Don't expose internal DB errors to users
    }
    // Unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    this.logger.error(
      `❌ ${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Send standardized error response
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}