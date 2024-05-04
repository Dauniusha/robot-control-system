import { type Operation } from '../entities/operation';

export interface OperationsRepository {
  create(operation: Operation): Promise<void>;
  getById(id: string): Promise<Operation>;
  update(robot: Operation): Promise<void>;
}
