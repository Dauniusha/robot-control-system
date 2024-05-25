import { type Schema, WebhookedSchemaPoint } from '../entities/schema';
import {
  type CoordinateDto,
  type SchemaPointDto,
  type WebhookedPointDto,
} from './create-map.dto';

export class SchemaDto {
  static fromEntity(schema: Schema): SchemaDto {
    return {
      id: schema.id,
      name: schema.name,
      robotId: schema.assignedRobot?.id,
      rows: schema.rows,
      columns: schema.columns,
      barriers: schema.barriers,
      base: {
        ...schema.robotBase.coordinate,
        name: schema.robotBase.name,
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
  base!: SchemaPointDto;
  points!: WebhookedPointDto[];
  barriers!: CoordinateDto[];
  robotId?: string;
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
