import type * as prisma from '../../../prisma/generated';
import { type Converter } from '../../core/utils/converters';
import { Coordinate, Schema } from '../../core/entities/schema';
import { type Robot } from '../../core/entities/robot';

export type SqlSchema = prisma.Schema & {
  assignedRobot?: Robot | null;
  robotBase: prisma.SchemaPoint;
  baseWebhookUrl: string;
  barriers: prisma.Barrier[];
  releasePoints: Array<
    prisma.ReleasePoint & {
      point: prisma.SchemaPoint;
    }
  >;
};

export class SqlSchemaToSchemaConverter
  implements Converter<SqlSchema, Schema>
{
  convert(details: SqlSchema): Schema {
    const schema = new Schema();

    schema.id = details.id;
    schema.assignedRobot = details.assignedRobot ?? undefined;

    schema.rows = details.rows;
    schema.columns = details.columns;
    schema.name = details.name;
    schema.robotBase = {
      id: details.robotBase.id,
      name: details.robotBase.name,
      coordinate: new Coordinate(details.robotBase.x, details.robotBase.y),
    };
    schema.robotBaseWebhookUrl = details.baseWebhookUrl;
    schema.barriers = details.barriers;
    schema.releasePoints = details.releasePoints.map((point) => ({
      id: point.id,
      name: point.point.name,
      coordinate: new Coordinate(point.point.x, point.point.y),
      webhookUrl: point.webhookUrl,
    }));

    return schema;
  }
}
