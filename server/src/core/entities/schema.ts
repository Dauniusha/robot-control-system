import * as crypto from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import { type Robot } from './robot';

export class Coordinate {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}
}

export class SchemaPoint {
  constructor(
    readonly name: string,
    readonly coordinate: Coordinate,
    readonly id: string = crypto.randomUUID(),
  ) {}
}

export class WebhookedSchemaPoint extends SchemaPoint {
  constructor(
    name: string,
    coordinate: Coordinate,
    readonly webhookUrl: string,
    id: string = crypto.randomUUID(),
  ) {
    super(name, coordinate, id);
  }
}

type SchemaDetails = {
  name: string;
  rows: number;
  columns: number;
  robotBase: SchemaPoint;
  barriers: Coordinate[];
  releasePoints: WebhookedSchemaPoint[];
};

export class Schema {
  static create(details: SchemaDetails) {
    const schema = new Schema();
    schema.id = crypto.randomUUID();
    schema.assignDetails(details);
    return schema;
  }

  id!: string;
  name!: string;
  rows!: number;
  columns!: number;
  assignedRobot?: Robot;
  robotBase!: SchemaPoint;
  barriers!: Coordinate[];
  releasePoints!: WebhookedSchemaPoint[];

  getPointsByIds(ids: string[]): SchemaPoint[] {
    const idsSet = new Set(ids);
    const points = this.releasePoints.filter(({ id }) => idsSet.has(id));

    if (points.length !== ids.length) {
      throw new BadRequestException(`Some of the points not found`);
    }

    return points;
  }

  getReleasePointByCoordinate(
    point: Coordinate,
  ): WebhookedSchemaPoint | undefined {
    const pointsMap = new Map(
      this.releasePoints.map((point) => [
        String(point.coordinate.x) + String(point.coordinate.y),
        point,
      ]),
    );

    return pointsMap.get(String(point.x) + String(point.y));
  }

  toMatrix(): number[][] {
    const matrix = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => 0),
    );

    for (const barrier of this.barriers) {
      matrix[barrier.y][barrier.x] = 1;
    }

    return matrix;
  }

  unassignRobot() {
    if (!this.assignedRobot) return;

    this.checkRobotAvailability();

    this.assignedRobot?.unassign();
    delete this.assignedRobot;
  }

  assignRobot(robot: Robot) {
    if (robot.schema) {
      throw new BadRequestException('Robot should be unassigned');
    }

    if (!robot.free) {
      throw new BadRequestException(`Robot ${robot.id} is in operation`);
    }

    if (!this.assignedRobot) {
      this.assignedRobot = robot;
      return;
    }

    this.checkRobotAvailability();

    this.assignedRobot = robot;
    robot.schema = this;
  }

  edit(details: SchemaDetails) {
    this.assignDetails(details);
  }

  private checkRobotAvailability() {
    if (this.assignedRobot?.free) {
      throw new BadRequestException('Currently assigned robot is in operation');
    }
  }

  private assignDetails(details: SchemaDetails) {
    this.name = details.name;
    this.rows = details.rows;
    this.columns = details.columns;
    this.robotBase = details.robotBase;
    this.barriers = details.barriers;
    this.releasePoints = details.releasePoints;
  }
}
