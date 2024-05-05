import { Robot } from '../../core/entities/robot';
import type * as prisma from '../../../prisma/generated';
import { type Converter } from '../../core/utils/converters';
import { type WorkloadStatus } from '../../core/entities/workload-status';
import { Operation } from '../../core/entities/operation';
import { type OperationStatus } from '../../core/entities/operation-status';
import { Schema } from '../../core/entities/schema';

type SqlOperation = prisma.Operation & {
  pathPoints: prisma.PathPoint[];
  schema: prisma.Schema;
};

type SqlDatabaseRobot = prisma.Robot & {
  status: prisma.WorkloadStatus;
  operations: SqlOperation[];
};

export class SqlRobotToRobotConverter
  implements Converter<SqlDatabaseRobot, Robot>
{
  convert(details: SqlDatabaseRobot): Robot {
    const robot = new Robot();

    robot.id = details.id;
    robot.status = {
      ...details.status,
      id: details.status.id as WorkloadStatus,
    };
    robot.model = details.model;
    robot.runningOperation = this.convertOperation(
      details.operations[0],
      robot,
    );

    return robot;
  }

  convertOperation(details: SqlOperation, robot: Robot): Operation {
    const operation = new Operation();
    operation.id = details.id;
    operation.robot = robot;

    operation.schema = new Schema();
    operation.schema.id = details.schema.id;

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
}
