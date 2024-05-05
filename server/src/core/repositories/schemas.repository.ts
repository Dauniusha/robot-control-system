import { type Schema } from '../entities/schema';

export interface SchemasRepository {
  getById(id: string): Promise<Schema | undefined>;
}
