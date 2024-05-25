import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { SortDto } from './sort.dto';

export enum SchemaSortField {
  Name = 'name',
  CreationDate = 'createdAt',
}

export class SchemaSortDto extends SortDto<SchemaSortField> {}

export class SearchPagingDto {
  static get defaultLimit() {
    return 20 as const;
  }

  static first(): SearchPagingDto {
    return new SearchPagingDto();
  }

  @ApiPropertyOptional({ name: 'paging[offset]' })
  @IsNumber()
  @Type(() => Number)
  offset = 0;

  @ApiPropertyOptional({ name: 'paging[limit]' })
  @IsNumber()
  @Type(() => Number)
  limit = SearchPagingDto.defaultLimit;
}

export class SchemaSearchRequestDto {
  @ApiProperty({
    type: String,
    example: '-price',
    required: false,
    default: null,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchemaSortDto)
  @Transform(({ value }) => SortDto.parse(SchemaSortDto, value as string))
  sort: SchemaSortDto[] = [];

  @ValidateNested()
  @Type(() => SearchPagingDto)
  paging: SearchPagingDto = SearchPagingDto.first();

  search?: string;
}
