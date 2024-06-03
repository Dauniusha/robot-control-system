import { type Operation } from '../entities/operation';
import { type OperationStatus } from '../entities/operation-status';
import { type CoordinateDto } from './create-map.dto';

export class OperationDto {
  static fromEntity(operation: Operation): OperationDto {
    console.log(operation.schema);
    const dto = new OperationDto();
    dto.createdAt = operation.createdAt;
    dto.doneAt = operation.doneAt;
    dto.status = operation.status;
    dto.paths = operation.paths;
    dto.schemaId = operation.schema.id;
    dto.schemaName = operation.schema.name;
    dto.id = operation.id;
    dto.robotSerialNo = operation.robot.serialNumber;
    return dto;
  }

  createdAt!: Date;
  doneAt?: Date;
  status!: OperationStatus;
  paths!: CoordinateDto[][];
  schemaId!: string;
  schemaName!: string;
  id!: string;
  robotSerialNo!: string;
}
