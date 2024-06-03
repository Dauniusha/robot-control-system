import * as crypto from 'node:crypto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkloadStatus } from './workload-status';
import { type Operation } from './operation';
import { type Schema } from './schema';

export class WorkloadStatusDetails {
  static free(): WorkloadStatusDetails {
    const details = new WorkloadStatusDetails();
    details.id = WorkloadStatus.Free;
    return details;
  }

  static inOperation(): WorkloadStatusDetails {
    const details = new WorkloadStatusDetails();
    details.id = WorkloadStatus.InOperation;
    return details;
  }

  static onHold(): WorkloadStatusDetails {
    const details = new WorkloadStatusDetails();
    details.id = WorkloadStatus.OnHold;
    return details;
  }

  id!: WorkloadStatus;
  name!: string;
  orderPosition!: number;
}

export class Robot {
  static create(details: { model: string; serialNumber: string }): Robot {
    const robot = new Robot();
    robot.id = crypto.randomUUID();
    robot.model = details.model;
    robot.serialNumber = details.serialNumber;
    robot.status = WorkloadStatusDetails.free();
    return robot;
  }

  id!: string;
  status!: WorkloadStatusDetails;
  model!: string;
  serialNumber!: string;
  runningOperation?: Omit<Operation, 'robot'>;
  schema?: Omit<Schema, 'assignedRobot'>;

  get free(): boolean {
    return this.status === WorkloadStatusDetails.free();
  }

  startOperation() {
    if (this.status.id !== WorkloadStatus.Free) {
      throw new BadRequestException(`Robot ${this.id} is not free`);
    }

    this.status = WorkloadStatusDetails.inOperation();
  }

  finishOperation() {
    if (!this.runningOperation) {
      throw new NotFoundException(
        `Running operation for robot ${this.id} not found`,
      );
    }

    if (this.status.id === WorkloadStatus.Free) {
      throw new BadRequestException(`Robot ${this.id} is not in operation`);
    }

    this.status = WorkloadStatusDetails.free();

    this.runningOperation.commit();
  }

  hold() {
    if (this.status.id === WorkloadStatus.OnHold) {
      throw new BadRequestException(`Robot ${this.id} is on hold already`);
    }

    this.status = WorkloadStatusDetails.onHold();
  }

  release() {
    if (this.status.id !== WorkloadStatus.OnHold) {
      throw new BadRequestException(`Robot ${this.id} should be on hold`);
    }

    this.status = WorkloadStatusDetails.inOperation();
  }

  unassign() {
    this.schema = undefined;
  }
}
