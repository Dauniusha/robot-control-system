import { IsEnum, IsString } from 'class-validator';

enum SortDirections {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Unified sorting model
 */
export class SortDto<SortingFieldEnum> {
  /**
   * Parsing to {@link SortDto} plain sorting string like "field,-field"
   *
   * @param constructor target sort class
   * @param plainSorting plain sorting string
   * @returns
   */
  static parse<T extends SortDto<unknown>>(
    constructor: new (..._: any[]) => T,
    plainSorting: string,
  ): T[] {
    return plainSorting.split(',').map((plainSort) => {
      const field = plainSort.trim();

      return field.startsWith('-')
        ? new constructor(field.slice(1), SortDirections.Desc)
        : new constructor(field, SortDirections.Asc);
    });
  }

  // eslint-disable-next-line @typescript-eslint/parameter-properties
  @IsString()
  field: SortingFieldEnum;

  // eslint-disable-next-line @typescript-eslint/parameter-properties
  @IsEnum(SortDirections)
  type: SortDirections;

  constructor(field: SortingFieldEnum, type: SortDirections) {
    this.field = field;
    this.type = type;
  }
}
