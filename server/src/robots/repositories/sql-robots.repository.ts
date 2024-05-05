import { type PrismaService } from '../../../prisma/prisma.service';
import { OperationStatus } from '../../core/entities/operation-status';
import { type Robot } from '../../core/entities/robot';
import { type Coordinate } from '../../core/entities/schema';
import { type RobotsRepository } from '../../core/repositories';
import { SqlRobotToRobotConverter } from '../converters/sql-robot-to-robot.converter';

export class SqlRobotsRepository implements RobotsRepository {
  private readonly robotConverter = new SqlRobotToRobotConverter();

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
            schema: true,
          },
          take: 1,
        },
      },
    });

    if (!robot) return undefined;

    return this.robotConverter.convert(robot);
  }

  async update(robot: Robot): Promise<void> {
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
    console.log('Log collector does not implemented');
  }
}
