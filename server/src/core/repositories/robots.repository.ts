import { type Robot } from '../entities/robot';
import { type Coordinate } from '../entities/schema';

export type RobotsRepository = {
  getById(id: string): Promise<Robot | undefined>;
  getBySerialNumber(number: string): Promise<Robot | undefined>;
  create(robot: Robot): Promise<void>;
  update(robot: Robot): Promise<void>;
  reachPoint(id: string, point: Coordinate): Promise<void>;
};
