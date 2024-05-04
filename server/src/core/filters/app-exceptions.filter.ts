import {
  type ArgumentsHost,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';

export class AppExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApplicationExceptionsFilter');

  async catch(exc: HttpException | Error, host: ArgumentsHost): Promise<void> {
    this.logger.error(exc, exc.stack);

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = { statusCode, message: exc.message, error: exc.message };
    if (exc instanceof HttpException) {
      statusCode = exc.getStatus();
      body = exc.getResponse();
    }

    await host
      .switchToHttp()
      .getResponse<FastifyReply>()
      .status(statusCode)
      .send(body);
  }
}
