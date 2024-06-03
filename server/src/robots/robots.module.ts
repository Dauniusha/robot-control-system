import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SqlSchemasRepository } from '../schemas/repositories/sql-schemas.repository';
import { RobotsService } from './robots.service';
import { SqlRobotsRepository } from './repositories/sql-robots.repository';
import { SqlOperationsRepository } from './repositories/sql-operations.repository';
import { RobotsController } from './robots.controller';
import { RobotsGateway } from './robots.gateway';

@Module({
  providers: [
    {
      provide: RobotsService,
      useValue: new RobotsService(
        new SqlRobotsRepository(new PrismaService()),
        new SqlSchemasRepository(new PrismaService()),
        new SqlOperationsRepository(new PrismaService()),
      ),
    },
    RobotsGateway,
  ],
  controllers: [RobotsController],
})
export class RobotsModule {}
