import * as crypto from 'node:crypto';
import { type PrismaService } from '../../../prisma/prisma.service';
import { type Path, type Operation } from '../../core/entities/operation';
import { type OperationsRepository } from '../../core/repositories';
import { SqlOperationToOperationConverter } from '../converters/sql-operation-to-operation.converter';
import { type PathPoint } from '../../../prisma/generated';

export class SqlOperationsRepository implements OperationsRepository {
  private readonly operationConverter = new SqlOperationToOperationConverter();

  constructor(private readonly prismaService: PrismaService) {}

  async getAll(): Promise<Operation[]> {
    const operations = await this.prismaService.client.operation.findMany({
      include: {
        schema: {
          include: {
            barriers: {
              select: { x: true, y: true },
            },
            releasePoints: {
              include: { point: true },
            },
            robotBase: true,
          },
        },
        pathPoints: true,
        robot: {
          include: { status: true },
        },
      },
    });

    return operations.map((item) => this.operationConverter.convert(item));
  }

  async create(operation: Operation): Promise<void> {
    const { robot, schema, paths, ...operationDetails } = operation;

    await this.prismaService.client.robot.update({
      where: { id: robot.id },
      data: {
        statusId: robot.status.id,
        operations: {
          create: {
            ...operationDetails,
            schemaId: schema.id,
            pathPoints: {
              createMany: { data: this.convertPaths(paths) },
            },
          },
        },
      },
    });
  }

  async getById(id: string): Promise<Operation | undefined> {
    const operation = await this.prismaService.client.operation.findUnique({
      where: { id },
      include: {
        schema: {
          include: {
            barriers: {
              select: { x: true, y: true },
            },
            releasePoints: {
              include: { point: true },
            },
            robotBase: true,
          },
        },
        pathPoints: true,
        robot: {
          include: { status: true },
        },
      },
    });

    if (!operation) return undefined;

    return this.operationConverter.convert(operation);
  }

  async update({ robot, ...operation }: Operation): Promise<void> {
    await this.prismaService.client.operation.update({
      where: { id: operation.id },
      data: {
        status: operation.status,
        doneAt: operation.doneAt,
        robot: {
          update: {
            where: { id: robot.id },
            data: {
              statusId: robot.status.id,
            },
          },
        },
      },
    });
  }

  private convertPaths(paths: Path[]): Array<Omit<PathPoint, 'operationId'>> {
    let pathPoints: Array<Omit<PathPoint, 'operationId'>> = [];

    for (const path of paths) {
      const points = path.map((point) => ({
        id: crypto.randomUUID(),
        x: point.x,
        y: point.y,
        targetPoint: false,
        visitNumber: 0,
      }));

      const targetPoint = points.pop()!;
      targetPoint.targetPoint = true;

      pathPoints = pathPoints.concat(points, targetPoint);
    }

    return pathPoints.map((point, index) => ({
      ...point,
      visitNumber: index,
    }));
  }
}
