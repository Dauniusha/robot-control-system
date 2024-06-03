import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SqlRobotsRepository } from '../robots/repositories/sql-robots.repository';
import { SchemasService } from './schemas.service';
import { SqlSchemasRepository } from './repositories/sql-schemas.repository';
import { SchemasController } from './schemas.controller';

@Module({
  providers: [
    {
      provide: SchemasService,
      useValue: new SchemasService(
        new SqlSchemasRepository(new PrismaService()),
        new SqlRobotsRepository(new PrismaService()),
      ),
    },
  ],
  controllers: [SchemasController],
})
export class SchemasModule {}
