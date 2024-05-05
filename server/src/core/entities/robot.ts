import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkloadStatus } from './workload-status';
import { type Operation } from './operation';

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
  id!: string;
  status!: WorkloadStatusDetails;
  model!: string;
  runningOperation?: Omit<Operation, 'robot'>;

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

    if (this.status.id !== WorkloadStatus.InOperation) {
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
}
