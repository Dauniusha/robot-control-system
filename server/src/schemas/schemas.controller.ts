import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateMapDto } from '../core/dto/create-map.dto';
import { AssignRobotRequestDto } from '../core/dto/assign-robot-request.dto';
import { type SchemaDto } from '../core/dto/schema-card.dto';
import { SchemaSearchRequestDto } from '../core/dto/schema-search-request.dto';
import { type SchemaSearchResponseDto } from '../core/dto/schema-search-response.dto';
import { SchemasService } from './schemas.service';

@Controller('schemas')
export class SchemasController {
  constructor(private readonly schemasService: SchemasService) {}

  @Get()
  async search(
    @Query() request: SchemaSearchRequestDto,
  ): Promise<SchemaSearchResponseDto> {
    return this.schemasService.search(request);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SchemaDto> {
    return this.schemasService.get(id);
  }

  @Post()
  async create(@Body() request: CreateMapDto): Promise<SchemaDto> {
    return this.schemasService.create(request);
  }

  @Put(':id')
  async edit(
    @Param('id') id: string,
    @Body() request: CreateMapDto,
  ): Promise<void> {
    await this.schemasService.edit(id, request);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.schemasService.delete(id);
  }

  @Post(':id')
  async assignRobot(
    @Param('id') id: string,
    @Body() request: AssignRobotRequestDto,
  ): Promise<void> {
    await this.schemasService.assignRobot(id, request);
  }
}
