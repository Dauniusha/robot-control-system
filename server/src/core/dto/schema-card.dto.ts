import { type Schema } from '../entities/schema';
import { type CoordinateDto, type WebhookedPointDto } from './create-map.dto';

export class SchemaDto {
  static fromEntity(schema: Schema): SchemaDto {
    return {
      id: schema.id,
      name: schema.name,
      robotId: schema.assignedRobot?.id,
      robotSerialNo: schema.assignedRobot?.serialNumber,
      rows: schema.rows,
      columns: schema.columns,
      barriers: schema.barriers,
      base: {
        ...schema.robotBase.coordinate,
        name: schema.robotBase.name,
        webhookUrl: schema.robotBaseWebhookUrl,
      },
      points: schema.releasePoints.map(({ coordinate, ...point }) => ({
        ...coordinate,
        ...point,
      })),
    };
  }

  id!: string;
  name!: string;
  rows!: number;
  columns!: number;
  base!: WebhookedPointDto;
  points!: WebhookedPointDto[];
  barriers!: CoordinateDto[];
  robotId?: string;
  robotSerialNo?: string;
}

export class SchemaCardDto {
  static fromEntity(schema: Schema): SchemaCardDto {
    return {
      id: schema.id,
      name: schema.name,
      robotName: schema.assignedRobot?.model,
      rows: schema.rows,
      columns: schema.columns,
    };
  }

  id!: string;
  name!: string;
  robotName?: string;
  rows!: number;
  columns!: number;
}
