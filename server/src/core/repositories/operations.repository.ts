import { type Operation } from '../entities/operation';

export type OperationsRepository = {
  create(operation: Operation): Promise<void>;
  getById(id: string): Promise<Operation | undefined>;
  update(robot: Operation): Promise<void>;
};
