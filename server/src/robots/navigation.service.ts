import { NotImplementedException } from '@nestjs/common';
import { type Schema, type SchemaPoint } from '../core/entities/schema';
import { type Path } from '../core/entities/operation';

export const NavigationService = {
  generatePath(schema: Schema, points: SchemaPoint[]): Path[] {
    throw new NotImplementedException();
  },
};
