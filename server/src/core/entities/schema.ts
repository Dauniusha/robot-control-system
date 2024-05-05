import { BadRequestException } from '@nestjs/common';
import { type Robot } from './robot';

export class Coordinate {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}
}

export interface SchemaPoint {
  id: string;
  name: string;
  coordinate: Coordinate;
}

export interface WebhookedSchemaPoint extends SchemaPoint {
  webhookUrl: string;
}

export class Schema {
  id!: string;
  name!: string;
  rows!: number;
  columns!: number;
  assignedRobot!: Robot;
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
}
