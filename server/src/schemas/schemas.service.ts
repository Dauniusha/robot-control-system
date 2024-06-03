import { BadRequestException, NotFoundException } from '@nestjs/common';
import { type CreateMapDto } from '../core/dto/create-map.dto';
import {
  type RobotsRepository,
  type SchemasRepository,
} from '../core/repositories';
import {
  Schema,
  SchemaPoint,
  WebhookedSchemaPoint,
} from '../core/entities/schema';
import { type SchemaSearchRequestDto } from '../core/dto/schema-search-request.dto';
import { SchemaSearchResponseDto } from '../core/dto/schema-search-response.dto';
import { SchemaCardDto, SchemaDto } from '../core/dto/schema-card.dto';
import { type AssignRobotRequestDto } from '../core/dto/assign-robot-request.dto';
import { type Robot } from '../core/entities/robot';

export class SchemasService {
  constructor(
    private readonly schemasRepository: SchemasRepository,
    private readonly robotRepository: RobotsRepository,
  ) {}

  async get(id: string): Promise<SchemaDto> {
    const schema = await this.getById(id);

    return SchemaDto.fromEntity(schema);
  }

  async search(
    request: SchemaSearchRequestDto,
  ): Promise<SchemaSearchResponseDto> {
    const result = await this.schemasRepository.search(request);

    if (result.items.length === 0) {
      return SchemaSearchResponseDto.createEmpty(request.paging);
    }

    return {
      items: result.items.map((item) => SchemaCardDto.fromEntity(item)),
      meta: {
        limit: request.paging.limit,
        offset: request.paging.offset,
        total: result.meta.total,
      },
    };
  }

  async getDetails(id: string): Promise<SchemaDto> {
    const schema = await this.getById(id);

    return SchemaDto.fromEntity(schema);
  }

  async create(request: CreateMapDto): Promise<SchemaDto> {
    const [existingSchema, robot] = await Promise.all([
      this.schemasRepository.getByName(request.name),
      this.getRobotBySerialNumber(request.robotSerialNumber),
    ]);

    if (existingSchema) {
      throw new BadRequestException(`Schema ${request.name} already exists`);
    }

    const schema = Schema.create({
      ...request,
      robotBase: new SchemaPoint(request.base.name, request.base),
      robotBaseWebhookUrl: request.baseWebhookUrl,
      releasePoints: request.points.map((point) => {
        return new WebhookedSchemaPoint(
          point.name,
          { x: point.x, y: point.y },
          point.webhookUrl,
        );
      }),
      assignedRobot: robot,
    });

    await this.schemasRepository.create(schema);
    return SchemaDto.fromEntity(schema);
  }

  async assignRobot(
    schemaId: string,
    request: AssignRobotRequestDto,
  ): Promise<void> {
    const [schema, robot] = await Promise.all([
      this.getById(schemaId),
      this.robotRepository.getById(request.robotId),
    ]);

    if (!robot) {
      throw new BadRequestException(`Robot ${request.robotId} was not found`);
    }

    const oldSchema = robot.schema;
    oldSchema?.unassignRobot();
    schema.assignRobot(robot);

    await this.schemasRepository.assignRobot(schema, oldSchema);
  }

  async edit(schemaId: string, request: CreateMapDto): Promise<void> {
    const [schema, robot] = await Promise.all([
      this.getById(schemaId),
      this.getRobotBySerialNumber(request.robotSerialNumber),
    ]);

    schema.edit({
      ...request,
      robotBase: new SchemaPoint(
        request.base.name,
        request.base,
        schema.robotBase.id,
      ),
      robotBaseWebhookUrl: request.baseWebhookUrl,
      releasePoints: request.points.map((point) => {
        return new WebhookedSchemaPoint(
          point.name,
          { x: point.x, y: point.y },
          point.webhookUrl,
        );
      }),
      assignedRobot: robot,
    });

    await this.schemasRepository.update(schema);
  }

  async delete(id: string): Promise<void> {
    const schema = await this.getById(id);

    await this.schemasRepository.delete(schema.id);
  }

  private async getById(id: string) {
    const schema = await this.schemasRepository.getById(id);

    if (!schema) throw new NotFoundException(`Schema ${id} not found`);
    return schema;
  }

  private async getRobotBySerialNumber(
    serialNumber?: string,
  ): Promise<Robot | undefined> {
    if (!serialNumber) return;

    const robot = await this.robotRepository.getBySerialNumber(serialNumber);

    if (!robot) {
      throw new NotFoundException(`Robot ${serialNumber} not found`);
    }

    return robot;
  }
}
