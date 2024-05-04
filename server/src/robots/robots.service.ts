import { BadRequestException, NotFoundException } from '@nestjs/common';
import { type RobotsRepository } from '../core/repositories/robots.repository';
import { Operation } from '../core/entities/operation';
import { type SchemasRepository } from '../core/repositories/schemas.repository';
import {
  type WebhookedSchemaPoint,
  type Coordinate,
} from '../core/entities/schema';
import { type Robot } from '../core/entities/robot';
import { type OperationsRepository } from '../core/repositories/operations.repository';
import { type InitiateOperationDto } from '../core/dto/initiate-operation.dto';

export enum RobotEvent {
  PathAccepted = 'path_accepted',
  PointReached = 'point_reached',
  OperationFinished = 'operation_finished',
  TargetPointReached = 'target_point_reached',
  Released = 'released',
}

export class RobotsService {
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

  async finishOperation(details: { id: string }): Promise<void> {
    const robot = await this.getById(details.id);

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
    });
  }
}
