import { ApiProperty } from '@nestjs/swagger';
import { type SearchPagingDto } from './schema-search-request.dto';
import { type SchemaCardDto } from './schema-card.dto';

export class BatchMeta {
  readonly offset!: number;
  readonly limit!: number;
  readonly total!: number;
}

export class SchemaSearchResponseDto {
  static createEmpty(paging: SearchPagingDto): SchemaSearchResponseDto {
    return {
      items: [],
      meta: {
        ...paging,
        total: 0,
      },
    };
  }

  items!: SchemaCardDto[];
  meta!: BatchMeta;
}
