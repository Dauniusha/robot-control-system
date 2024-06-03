import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './core/logging';
import { RequestLoggerMiddleware } from './core/middlewares';
import { ConfigModule } from './core/config/config.module';
import { RobotsModule } from './robots/robots.module';
import { SchemasModule } from './schemas/schemas.module';

@Module({
  imports: [ConfigModule, LoggerModule, RobotsModule, SchemasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestLoggerMiddleware)
      .exclude('docs', 'docs/(.*)')
      .forRoutes('*');
  }
}
