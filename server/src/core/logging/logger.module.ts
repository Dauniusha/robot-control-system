import { Global, Module } from '@nestjs/common';
import { Config } from '../config';
import { Logger } from './logger';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: Logger,
      useFactory: (): Logger => new Logger(new Config()),
    },
  ],
})
export class LoggerModule {}
