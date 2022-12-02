import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    let errorMessage = exceptionResponse.message;

    if (typeof errorMessage === 'string') {
      const [key, value] = errorMessage.split(':');
      console.log(key, value);
      errorMessage = JSON.stringify({
        [key]: value || 'UNAUTHORIZED',
      });
    }

    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      errorMessage = JSON.stringify(
        exceptionResponse.message.reduce((res, error) => {
          const [key, value] = error.split(':');
          res[key] = value;
          return res;
        }, {}),
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: errorMessage,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
