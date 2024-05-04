import { type LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { type Config } from '../config';
import { formatWinstonLog } from './utils/format-log.util';

export class Logger implements LoggerService {
  private readonly logger: winston.Logger;

  private get defaultContext() {
    return 'UnknownContext';
  }

  private get defaultLoggingDepth() {
    return 3;
  }

  constructor(config: Config) {
    const {
      console: { level },
      depth = this.defaultLoggingDepth,
    } = config.logging;

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level,
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp({ format: 'h:mm:ss A' }),
          winston.format.splat(),
          winston.format.ms(),
          winston.format.prettyPrint(),
          winston.format.printf((log) => formatWinstonLog(log, depth)),
        ),
      }),
    ];

    this.logger = winston.createLogger({ transports });
  }

  log(message: string, ...optionalParameters: [...any, string?]): void {
    this.logger.info(message, {
      context: this.extractContextFromParams(optionalParameters),
      value: this.composeMetadata(optionalParameters),
    });
  }

  error(
    message: Error | string,
    ...optionalParameters: [...any, string?, string?]
  ): void {
    const [stack, context] = optionalParameters
      .slice(-2)
      .filter((x) => /string|undefined/.exec((typeof x))) as Array<string | undefined>; // prettier-ignore

    // Winston extract message from Error automaticaly
    this.logger.error(message as string, {
      context: context ?? this.defaultContext,
      stack: message instanceof Error ? message.stack : stack,
      value: this.composeMetadata(optionalParameters),
    });
  }

  warn(message: string, ...optionalParameters: [...any, string?]): void {
    this.logger.warn(message, {
      context: this.extractContextFromParams(optionalParameters),
      value: this.composeMetadata(optionalParameters),
    });
  }

  debug(message: string, ...optionalParameters: [...any, string?]): void {
    this.logger.debug(message, {
      context: this.extractContextFromParams(optionalParameters),
      value: this.composeMetadata(optionalParameters),
    });
  }

  verbose(message: string, ...optionalParameters: [...any, string?]): void {
    this.logger.verbose(message, {
      context: this.extractContextFromParams(optionalParameters),
      value: this.composeMetadata(optionalParameters),
    });
  }

  private composeMetadata(
    optionalParameters: [...any, string?],
  ): Record<string, unknown> {
    return Object.assign(
      {},
      ...(optionalParameters.filter((meta) => meta instanceof Object) as Array<
        Record<string, unknown>
      >),
    ) as Record<string, unknown>;
  }

  private extractContextFromParams(
    optionalParameters: [...any, string?],
  ): string {
    return typeof optionalParameters.at(-1) === 'string'
      ? (optionalParameters.pop() as string)
      : this.defaultContext;
  }
}
