import type * as prisma from '../../../prisma/generated';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type SchemaSortDto,
  SchemaSortField,
  type SchemaSearchRequestDto,
} from '../../core/dto/schema-search-request.dto';
import { type SchemaPoint, type Schema } from '../../core/entities/schema';
import { type SchemasRepository } from '../../core/repositories';
import { SqlRobotToRobotConverter } from '../../robots/converters/sql-robot-to-robot.converter';
import { SqlSchemaToSchemaConverter } from '../converters/sql-schema-to-schema.converter';

export class SqlSchemasRepository implements SchemasRepository {
  private readonly schemaConverter = new SqlSchemaToSchemaConverter();
  private readonly robotConverter = new SqlRobotToRobotConverter();

  constructor(private readonly prismaService: PrismaService) {}

  async getById(id: string): Promise<Schema | undefined> {
    const schema = await this.prismaService.client.schema.findUnique({
      where: { id },
      include: {
        robotBase: true,
        releasePoints: {
          include: { point: true },
        },
        barriers: true,
        assignedRobot: {
          include: {
            status: true,
          },
        },
      },
    });

    if (!schema) return undefined;

    console.log(schema.assignedRobot);
    const robot =
      schema.assignedRobot && this.robotConverter.convert(schema.assignedRobot);

    console.log(robot);
    return this.schemaConverter.convert({
      ...schema,
      assignedRobot: robot,
    });
  }

  async getByName(name: string): Promise<Schema | undefined> {
    const schema = await this.prismaService.client.schema.findUnique({
      where: { name },
      include: {
        robotBase: true,
        releasePoints: {
          include: { point: true },
        },
        barriers: true,
      },
    });

    if (!schema) return undefined;

    return this.schemaConverter.convert(schema);
  }

  async search(
    request: SchemaSearchRequestDto,
  ): Promise<{ items: Schema[]; meta: { total: number } }> {
    const orderBy = request.sort.flatMap((sort) => this.convertSort(sort));

    const whereQuery: prisma.Prisma.SchemaWhereInput = {
      name: request.search && {
        contains: request.search,
        mode: 'insensitive',
      },
    };

    const [items, total] = await Promise.all([
      this.prismaService.client.schema.findMany({
        skip: request.paging?.offset,
        take: request.paging?.limit,
        where: whereQuery,
        include: {
          robotBase: true,
          releasePoints: {
            include: { point: true },
          },
          barriers: true,
        },
        orderBy,
      }),
      this.prismaService.client.schema.count({
        where: whereQuery,
      }),
    ]);

    const users = items.map((item) => this.schemaConverter.convert(item));

    return {
      items: users,
      meta: request.paging && { ...request.paging, total },
    };
  }

  async create(schema: Schema): Promise<void> {
    await this.prismaService.createTransaction(async (client) => {
      await client.schemaPoint.createMany({
        data: schema.releasePoints.map((point) =>
          this.getPointUpdateOption(point),
        ),
      });

      const schemaPoint = await client.schemaPoint.create({
        data: this.getPointUpdateOption(schema.robotBase),
      });

      await client.schema.create({
        data: {
          id: schema.id,
          assignedRobotId: schema.assignedRobot?.id,
          name: schema.name,
          rows: schema.rows,
          columns: schema.columns,
          robotBaseId: schemaPoint.id,
          baseWebhookUrl: schema.robotBaseWebhookUrl,
          barriers: { createMany: { data: schema.barriers } },
          releasePoints: {
            createMany: {
              data: schema.releasePoints.map((point) => ({
                id: point.id,
                pointId: point.id,
                webhookUrl: point.webhookUrl,
              })),
            },
          },
        },
      });
    });
  }

  async assignRobot(
    schema: Schema,
    oldSchema?: Omit<Schema, 'assignedRobot'> | undefined,
  ): Promise<void> {
    const queries = [
      this.prismaService.client.schema.update({
        where: { id: schema.id },
        data: {
          assignedRobotId: schema.assignedRobot?.id,
        },
      }),
    ];

    if (oldSchema) {
      queries.push(
        this.prismaService.client.schema.update({
          where: { id: oldSchema.id },
          data: { assignedRobotId: null },
        }),
      );
    }

    await this.prismaService.createTransaction(queries);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.client.schema.delete({
      where: { id },
    });
  }

  async update(schema: Schema): Promise<void> {
    await this.prismaService.createTransaction(async (client) => {
      await Promise.all([
        client.schemaPoint.deleteMany({
          where: {
            releasePoints: {
              some: {
                schemaId: schema.id,
              },
            },
          },
        }),
        client.barrier.deleteMany({
          where: { schemaId: schema.id },
        }),
      ]);

      const basePoint = await client.schemaPoint.upsert({
        where: { id: schema.robotBase.id },
        create: this.getPointUpdateOption(schema.robotBase),
        update: this.getPointUpdateOption(schema.robotBase),
      });

      await client.schemaPoint.createMany({
        data: schema.releasePoints.map((point) =>
          this.getPointUpdateOption(point),
        ),
      });

      await client.schema.update({
        where: { id: schema.id },
        data: {
          assignedRobotId: schema.assignedRobot?.id,
          name: schema.name,
          rows: schema.rows,
          columns: schema.columns,
          robotBaseId: basePoint.id,
          barriers: { createMany: { data: schema.barriers } },
          releasePoints: {
            createMany: {
              data: schema.releasePoints.map((point) => ({
                id: point.id,
                pointId: point.id,
                webhookUrl: point.webhookUrl,
              })),
            },
          },
        },
      });
    });
  }

  private convertSort(
    sort: SchemaSortDto,
  ):
    | prisma.Prisma.SchemaOrderByWithRelationInput
    | prisma.Prisma.SchemaOrderByWithRelationInput[] {
    const sqlSortType = PrismaService.convertSortType(sort.type);

    const sortFieldsMap = {
      [SchemaSortField.Name]: { name: sqlSortType },
      [SchemaSortField.CreationDate]: { createdAt: sqlSortType },
    };

    return sortFieldsMap[sort.field];
  }

  private getPointUpdateOption(
    point: SchemaPoint,
  ): prisma.Prisma.SchemaPointUpdateInput &
    prisma.Prisma.SchemaPointCreateInput {
    return {
      id: point.id,
      name: point.name,
      ...point.coordinate,
    };
  }
}
