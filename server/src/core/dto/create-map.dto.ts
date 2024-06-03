import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CoordinateDto {
  @IsNumber()
  @Min(0)
  @Max(200)
  @Type(() => Number)
  x!: number;

  @IsNumber()
  @Min(0)
  @Max(200)
  @Type(() => Number)
  y!: number;
}

export class SchemaPointDto extends CoordinateDto {
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;
}

export class WebhookedPointDto extends SchemaPointDto {
  @IsNotEmpty()
  @MaxLength(255)
  webhookUrl!: string;
}

export class CreateMapDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WebhookedPointDto)
  points!: WebhookedPointDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  barriers: CoordinateDto[] = [];

  @ValidateNested()
  @Type(() => SchemaPointDto)
  base!: SchemaPointDto;

  @IsNotEmpty()
  @MaxLength(255)
  baseWebhookUrl!: string;

  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @IsNotEmpty()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  rows!: number;

  @IsNotEmpty()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  columns!: number;

  @IsOptional()
  @MaxLength(30)
  robotSerialNumber?: string;
}
