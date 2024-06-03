import { type Robot } from '../entities/robot';

export class RobotDto {
  static fromEntity(robot: Robot): RobotDto {
    return {
      id: robot.id,
      serialNumber: robot.serialNumber,
      model: robot.model,
      statusId: robot.status.id,
      status: robot.status.name,
    };
  }

  id!: string;
  serialNumber!: string;
  model!: string;
  statusId!: string;
  status!: string;
}
