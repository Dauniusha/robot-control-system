import 'source-map-support/register';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify/adapters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from './core/logging';
import { AppExceptionsFilter } from './core/filters';
import { ParseQueryStringPipe } from './core/pipes/parse-query-string.pipe';
import { Config } from './core/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  const config = app.get(Config);
  app.enableCors({
    origin: [config.clientAppUrl],
    credentials: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AppExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ParseQueryStringPipe(),
    new ValidationPipe({ transform: true }),
  );

  const openApiConfig = new DocumentBuilder()
    .setTitle('Robot Control System API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, '0.0.0.0');
}

void bootstrap();
