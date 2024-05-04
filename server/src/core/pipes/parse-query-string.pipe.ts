import { type ArgumentMetadata } from '@nestjs/common';
import { parse } from 'qs';

export class ParseQueryStringPipe {
  transform(
    value: string,
    metadata: ArgumentMetadata,
  ): Record<string, unknown> | string {
    return metadata.type === 'query' ? parse(value) : value;
  }
}
