import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InitiateOperationDto } from '../core/dto/initiate-operation.dto';
import { RobotDto } from '../core/dto/robot.dto';
import { CreateRobotDto } from '../core/dto/create-robot.dto';
import { OperationDto } from '../core/dto/operation.dto';
import { RobotEvent, RobotsService } from './robots.service';
import { RobotsGateway } from './robots.gateway';

@Controller('robots')
export class RobotsController {
  constructor(private readonly robotsService: RobotsService) {}

  @Get('operations')
  getOperations(): Promise<OperationDto[]> {
    return this.robotsService.getOperations();
  }

  @Get('operations/:id')
  getOperation(@Param('id') id: string): Promise<OperationDto> {
    return this.robotsService.getOperation(id);
  }

  @Get(':id/events')
  getOperationEvent(@Param('id') id: string) {
    return RobotsGateway.getClientMessages(id);
  }

  @Post()
  create(@Body() request: CreateRobotDto): Promise<RobotDto> {
    return this.robotsService.create(request);
  }

  @Post('operations/:id/release')
  async release(@Param('id') operationId: string): Promise<void> {
    const robot = await this.robotsService.release(operationId);
    RobotsGateway.emit(robot.id, RobotEvent.Released);
  }

  @Post('operations/initiate')
  async initiateOperation(
    @Body() request: InitiateOperationDto,
  ): Promise<void> {
    const operation = await this.robotsService.initiateOperation(request);

    RobotsGateway.emit(
      operation.robot.id,
      RobotEvent.PathAccepted,
      operation.paths,
    );
    RobotsGateway.flushMessages(operation.robot.id);
  }
}
