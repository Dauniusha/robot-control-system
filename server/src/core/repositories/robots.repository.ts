import { type Robot } from '../entities/robot';
import { type Coordinate } from '../entities/schema';

export interface RobotsRepository {
  getById(id: string): Promise<Robot | undefined>;
  update(robot: Robot): Promise<void>;
  reachPoint(id: string, point: Coordinate): Promise<void>;
}
