import { type Robot } from '../../core/entities/robot';
import type * as prisma from '../../../prisma/generated';
import { type Converter } from '../../core/utils/converters';
import { Operation } from '../../core/entities/operation';
import { type OperationStatus } from '../../core/entities/operation-status';
import { Schema } from '../../core/entities/schema';
import {
  SqlRobotToRobotConverter,
  type SqlRobot,
} from './sql-robot-to-robot.converter';

type SqlOperation = prisma.Operation & {
  pathPoints: prisma.PathPoint[];
  schema: prisma.Schema & {
    barriers: Array<Omit<prisma.Barrier, 'schemaId'>>;
    releasePoints: Array<
      prisma.ReleasePoint & {
        point: prisma.SchemaPoint;
      }
    >;
    robotBase: prisma.SchemaPoint;
  };
  robot: Omit<SqlRobot, 'operations'>;
};

export class SqlOperationToOperationConverter
  implements Converter<SqlOperation, Operation>
{
  private readonly robotConverter = new SqlRobotToRobotConverter();

  convert(details: SqlOperation): Operation {
    const operation = new Operation();
    operation.id = details.id;

    operation.schema = new Schema();
    operation.schema.id = details.schema.id;
    operation.schema.columns = details.schema.columns;
    operation.schema.rows = details.schema.rows;
    operation.schema.barriers = details.schema.barriers;
    operation.schema.releasePoints = details.schema.releasePoints.map(
      (point) => ({
        id: point.id,
        coordinate: { x: point.point.x, y: point.point.y },
        name: point.point.name,
        webhookUrl: point.webhookUrl,
      }),
    );

    const robotBase = details.schema.robotBase;
    operation.schema.robotBase = {
      id: robotBase.id,
      name: robotBase.name,
      coordinate: { x: robotBase.x, y: robotBase.y },
    };

    operation.robot = this.robotConverter.convert(details.robot);

    operation.paths = [];
    let path = [];
    for (const point of details.pathPoints) {
      path.push(point);

      if (point.targetPoint) {
        operation.paths.push(path);
        path = [];
      }
    }

    operation.status = details.status as OperationStatus;
    operation.createdAt = details.createdAt;
    operation.doneAt = details.doneAt ?? undefined;
    return operation;
  }

  convertSchema(details: SqlOperation['schema']): Schema {
    const schema = new Schema();
    schema.id = details.id;
    schema.columns = details.columns;
    schema.rows = details.rows;
    schema.barriers = details.barriers;
    schema.releasePoints = details.releasePoints.map((point) => ({
      id: point.id,
      coordinate: { x: point.point.x, y: point.point.y },
      name: point.point.name,
      webhookUrl: point.webhookUrl,
    }));

    const robotBase = details.robotBase;
    schema.robotBase = {
      id: robotBase.id,
      name: robotBase.name,
      coordinate: { x: robotBase.x, y: robotBase.y },
    };

    return schema;
  }
}
