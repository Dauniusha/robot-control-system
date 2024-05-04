import { Global, Module } from '@nestjs/common';
import { Config } from '.';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: Config,
      useValue: new Config(),
    },
  ],
  exports: [Config],
})
export class ConfigModule {}
