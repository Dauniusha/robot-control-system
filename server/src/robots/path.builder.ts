import {
  type Coordinate,
  type Schema,
  type SchemaPoint,
} from '../core/entities/schema';
import { type Path } from '../core/entities/operation';
import * as leeAlgorithm from './lee-algorithm';
import AntColonyOptimizer from './ant-colony.optimizer';

export class PathBuilder {
  private readonly matrixedSchema: number[][];
  private readonly robotBaseCoordinate: Coordinate;
  private targetPoints: Coordinate[] = [];
  private pathMatrix: Path[][] = [];
  private basePosition = 0;

  constructor(schema: Schema) {
    this.matrixedSchema = schema.toMatrix();
    this.robotBaseCoordinate = schema.robotBase.coordinate;
  }

  withTargetPoints(targetPoints: SchemaPoint[]): this {
    this.targetPoints = [
      ...targetPoints.map((point) => point.coordinate),
      this.robotBaseCoordinate,
    ];
    this.basePosition = this.targetPoints.length - 1;

    return this;
  }

  build(): Path[] {
    // Can be optimized be calculation only one half of matrix
    // [
    //   [0, 2, 3, 4, 5],
    //   [2, 0, 6, 7, 8],
    //   [3, 6, 0, 9, 10],
    //   [4, 7, 9, 0, 11],
    //   [5, 8, 10, 11, 0],
    // ]
    this.pathMatrix = this.targetPoints.map((startPoint) => {
      return this.targetPoints.map((endPoint) =>
        leeAlgorithm.findPath(this.matrixedSchema, startPoint, endPoint),
      );
    });

    const distanceMatrix = this.pathMatrix.map((row) =>
      row.map((column) => column.length - 1),
    );

    const antOptimizer = new AntColonyOptimizer({
      distanceMatrix,
      distanceCoef: 2,
      smellCoef: 1,
      numberAnts: 5,
      numberIterations: 10,
      startPosition: this.basePosition,
      finishPosition: this.basePosition,
    });
    const [citiesPath, bestPathLength] = antOptimizer.run();

    console.log('Best cities path:', citiesPath);
    console.log('Best path length:', bestPathLength);

    return this.convertCitiesPathToPath(citiesPath);
  }

  private convertCitiesPathToPath(citiesPath: number[]): Path[] {
    const paths: Path[] = [];
    for (let i = 0; i < citiesPath.length - 1; i++) {
      const cityA = citiesPath[i];
      const cityB = citiesPath[i + 1];
      paths.push(this.pathMatrix[cityA][cityB]);
    }

    return paths;
  }
}
