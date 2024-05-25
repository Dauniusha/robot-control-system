import { type SchemaSearchRequestDto } from '../dto/schema-search-request.dto';
import { type Schema } from '../entities/schema';

export type SchemasRepository = {
  getById(id: string): Promise<Schema | undefined>;
  getByName(name: string): Promise<Schema | undefined>;
  search(request: SchemaSearchRequestDto): Promise<{
    items: Schema[];
    meta: { total: number };
  }>;
  create(schema: Schema): Promise<void>;
  assignRobot(
    schema: Schema,
    oldSchema?: Omit<Schema, 'assignedRobot'>,
  ): Promise<void>;
  update(schema: Schema): Promise<void>;
  delete(id: string): Promise<void>;
};
