import * as crypto from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import { PathBuilder } from '../../robots/path.builder';
import { type Coordinate, type Schema } from './schema';
import { type Robot } from './robot';
import { OperationStatus } from './operation-status';

export type Path = Coordinate[];

export class Operation {
  static initiate(schema: Schema, pointIds: string[]): Operation {
    if (!schema.assignedRobot) {
      throw new BadRequestException('Robot is not assigned');
    }

    schema.assignedRobot.startOperation();
    const points = schema.getPointsByIds(pointIds);
    const paths = new PathBuilder(schema).withTargetPoints(points).build();

    return Operation.create(schema, paths);
  }

  private static create(schema: Schema, paths: Path[]) {
    if (!schema.assignedRobot) {
      throw new BadRequestException('Robot is not assigned');
    }

    const operation = new Operation();
    operation.id = crypto.randomUUID();
    operation.schema = schema;
    operation.robot = schema.assignedRobot;
    operation.paths = paths;
    return operation;
  }

  id!: string;
  robot!: Robot;
  schema!: Schema;
  paths!: Path[];
  status: OperationStatus = OperationStatus.InProgress;
  createdAt: Date = new Date();
  doneAt?: Date;

  commit() {
    this.status = OperationStatus.Done;
    this.doneAt = new Date();
  }

  release() {
    if (this.status !== OperationStatus.InProgress) {
      throw new BadRequestException(`Operation ${this.id} is not in progress`);
    }

    this.robot.release();
  }
}
