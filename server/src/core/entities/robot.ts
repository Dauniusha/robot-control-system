import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkloadStatus } from './workload-status';
import { type Operation } from './operation';

export class Robot {
  id!: string;
  status!: WorkloadStatus;
  model!: string;
  runningOperation?: Omit<Operation, 'robot'>;

  get free(): boolean {
    return this.status === WorkloadStatus.Free;
  }

  startOperation() {
    if (this.status !== WorkloadStatus.Free) {
      throw new BadRequestException(`Robot ${this.id} is not free`);
    }

    this.status = WorkloadStatus.InOperation;
  }

  finishOperation() {
    if (!this.runningOperation) {
      throw new NotFoundException(
        `Running operation for robot ${this.id} not found`,
      );
    }

    if (this.status !== WorkloadStatus.InOperation) {
      throw new BadRequestException(`Robot ${this.id} is not in operation`);
    }

    this.status = WorkloadStatus.Free;

    this.runningOperation.commit();
  }

  hold() {
    if (this.status === WorkloadStatus.OnHold) {
      throw new BadRequestException(`Robot ${this.id} is on hold already`);
    }

    this.status = WorkloadStatus.OnHold;
  }

  release() {
    if (this.status !== WorkloadStatus.OnHold) {
      throw new BadRequestException(`Robot ${this.id} should be on hold`);
    }

    this.status = WorkloadStatus.InOperation;
  }
}
