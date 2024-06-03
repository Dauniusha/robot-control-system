import {
  BadRequestException,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type RobotsRepository } from '../core/repositories/robots.repository';
import { Operation } from '../core/entities/operation';
import { type SchemasRepository } from '../core/repositories/schemas.repository';
import {
  type WebhookedSchemaPoint,
  type Coordinate,
} from '../core/entities/schema';
import { Robot } from '../core/entities/robot';
import { type OperationsRepository } from '../core/repositories/operations.repository';
import { type InitiateOperationDto } from '../core/dto/initiate-operation.dto';
import { type CreateRobotDto } from '../core/dto/create-robot.dto';
import { RobotDto } from '../core/dto/robot.dto';
import { OperationDto } from '../core/dto/operation.dto';

export enum RobotEvent {
  PathAccepted = 'path_accepted',
  PointReached = 'point_reached',
  OperationFinished = 'operation_finished',
  TargetPointReached = 'target_point_reached',
  Released = 'released',
}

export class RobotsService {
  private readonly logger = new Logger('RobotsService');

  constructor(
    private readonly robotsRepository: RobotsRepository,
    private readonly schemasRepository: SchemasRepository,
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async initiateOperation(request: InitiateOperationDto): Promise<Operation> {
    const schema = await this.schemasRepository.getById(request.schemaId);

    if (!schema) {
      throw new NotFoundException(
        `Schema with id ${request.schemaId} not found.`,
      );
    }

    const operation = Operation.initiate(schema, request.pointIds);

    await this.operationsRepository.create(operation);
    return operation;
  }

  async finishOperation(
    robotId: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    const robot = await this.getById(robotId);

    robot.finishOperation();

    await this.robotsRepository.update(robot);
  }

  async reachTargetPoint(id: string, point: Coordinate): Promise<void> {
    const robot = await this.getById(id);

    const releasePoint =
      robot.runningOperation?.schema.getReleasePointByCoordinate(point);

    if (!releasePoint) {
      throw new BadRequestException(
        `Relese point ${point.x}:${point.y} not found`,
      );
    }

    robot.hold();

    await this.robotsRepository.update(robot);
    await this.notifyConsumer(robot, releasePoint);
  }

  async reachPoint(id: string, point: Coordinate): Promise<void> {
    await this.robotsRepository.reachPoint(id, point);
  }

  async release(operationId: string): Promise<Robot> {
    const operation = await this.operationsRepository.getById(operationId);

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    operation.release();

    await this.operationsRepository.update(operation);
    return operation.robot;
  }

  async create(request: CreateRobotDto): Promise<RobotDto> {
    const existingRobot = await this.robotsRepository.getBySerialNumber(
      request.serialNumber,
    );

    if (existingRobot) {
      throw new BadRequestException(
        `Robot ${request.serialNumber} already exists`,
      );
    }

    const robot = Robot.create(request);

    await this.robotsRepository.create(robot);
    return RobotDto.fromEntity(robot);
  }

  async getOperations(): Promise<OperationDto[]> {
    const operations = await this.operationsRepository.getAll();

    return operations.map((entity) => OperationDto.fromEntity(entity));
  }

  async getOperation(id: string): Promise<OperationDto> {
    const operation = await this.operationsRepository.getById(id);

    if (!operation) throw new NotFoundException(`Operation ${id} not found`);

    return OperationDto.fromEntity(operation);
  }

  private async getById(id: string): Promise<Robot> {
    const robot = await this.robotsRepository.getById(id);

    if (!robot) throw new NotFoundException(`Robot with id ${id} not found.`);

    return robot;
  }

  private async notifyConsumer(
    robot: Robot,
    releasePoint: WebhookedSchemaPoint,
  ): Promise<void> {
    await fetch(releasePoint.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        robotId: robot.id,
        operationId: robot.runningOperation!.id,
        releaseAt: new Date(),
      }),
    })
      .then(async (response: Response) => {
        if (!response.ok) {
          const error = (await response.json()) as {
            message: string;
            statusCode: number;
          };

          throw new HttpException(error, error.statusCode);
        }

        this.logger.log(
          `Point ${releasePoint.name} done by robot ${robot.serialNumber} in operation ${robot.runningOperation!.id}`,
        );
      })
      .catch((error: Error) => {
        this.logger.error(error);
      });
  }
}
