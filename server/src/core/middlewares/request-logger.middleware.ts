import * as process from 'node:process';
import { Logger, type NestMiddleware } from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';

export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(
    request: FastifyRequest,
    response: FastifyReply['raw'],
    next: (error?: any) => void,
  ): void {
    const start = process.hrtime.bigint();
    const { ip, method, originalUrl } = request;
    const userAgent = request.headers['user-agent'] ?? '';

    response.on('finish', () => {
      const { statusCode } = response;
      const end = process.hrtime.bigint();
      const processingTime = (end - start) / BigInt(10 ** 6);
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${processingTime}ms - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
