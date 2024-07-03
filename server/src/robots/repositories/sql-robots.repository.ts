import { type PrismaService } from '../../../prisma/prisma.service';
import { OperationStatus } from '../../core/entities/operation-status';
import { type Robot } from '../../core/entities/robot';
import { type Coordinate } from '../../core/entities/schema';
import { type RobotsRepository } from '../../core/repositories';
import { SqlSchemaToSchemaConverter } from '../../schemas/converters/sql-schema-to-schema.converter';
import { SqlRobotToRobotConverter } from '../converters/sql-robot-to-robot.converter';

export class SqlRobotsRepository implements RobotsRepository {
  private readonly robotConverter = new SqlRobotToRobotConverter();
  private readonly schemaConverter = new SqlSchemaToSchemaConverter();

  constructor(private readonly prismaService: PrismaService) {}

  async getById(id: string): Promise<Robot | undefined> {
    const robot = await this.prismaService.client.robot.findUnique({
      where: { id },
      include: {
        status: true,
        operations: {
          where: { status: OperationStatus.InProgress },
          include: {
            pathPoints: {
              orderBy: [{ visitNumber: 'asc' }],
            },
            schema: {
              include: {
                barriers: true,
                robotBase: true,
                releasePoints: {
                  include: {
                    point: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!robot) return undefined;

    const operations = robot.operations.map((operation) => ({
      ...operation,
      schema: this.schemaConverter.convert(operation.schema),
    }));

    return this.robotConverter.convert({
      ...robot,
      operations,
    });
  }

  async getBySerialNumber(number: string): Promise<Robot | undefined> {
    const robot = await this.prismaService.client.robot.findUnique({
      where: { serialNumber: number },
      include: {
        status: true,
        operations: {
          where: { status: OperationStatus.InProgress },
          include: {
            pathPoints: {
              orderBy: [{ visitNumber: 'asc' }],
            },
            schema: {
              include: {
                barriers: true,
                robotBase: true,
                releasePoints: {
                  include: {
                    point: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!robot) return undefined;

    const operations = robot.operations.map((operation) => ({
      ...operation,
      schema: this.schemaConverter.convert(operation.schema),
    }));

    return this.robotConverter.convert({
      ...robot,
      operations,
    });
  }

  async create(robot: Robot): Promise<void> {
    await this.prismaService.client.robot.create({
      data: {
        id: robot.id,
        model: robot.model,
        serialNumber: robot.serialNumber,
        statusId: robot.status.id,
      },
    });
  }

  async update(robot: Robot): Promise<void> {
    console.log(robot);
    await this.prismaService.client.robot.update({
      where: { id: robot.id },
      data: {
        model: robot.model,
        statusId: robot.status.id,
        operations: {
          update: {
            where: { id: robot.runningOperation?.id },
            data: {
              status: robot.runningOperation?.status,
              doneAt: robot.runningOperation?.doneAt,
            },
          },
        },
      },
    });
  }

  async reachPoint(id: string, point: Coordinate): Promise<void> {
    // Console.log('Log collector does not implemented');
    console.log(`Point ${point.y}:${point.x} reached by robot ${id}`);
  }
}
