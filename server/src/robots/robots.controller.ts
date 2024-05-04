import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Coordinate } from '../core/entities/schema';
import { InitiateOperationDto } from '../core/dto/initiate-operation.dto';
import { RobotEvent, RobotsService } from './robots.service';

@WebSocketGateway()
@Controller('robots')
export class RobotsController {
  @WebSocketServer()
  server!: Server;

  private readonly clientsMap = new Map<string, Socket>();

  constructor(private readonly robotsService: RobotsService) {}

  @SubscribeMessage('connection')
  connect(@Query('id') id: string, @ConnectedSocket() client: Socket): void {
    this.clientsMap.set(id, client);
  }

  @SubscribeMessage(RobotEvent.PointReached)
  async reachPoint(
    @Query('id') id: string,
    @MessageBody('point') point: Coordinate,
  ): Promise<void> {
    await this.robotsService.reachPoint(id, point);
  }

  @SubscribeMessage(RobotEvent.TargetPointReached)
  async reachTargetPoint(
    @Query('id') id: string,
    @MessageBody('point') point: Coordinate,
  ): Promise<void> {
    await this.robotsService.reachTargetPoint(id, point);
  }

  @SubscribeMessage(RobotEvent.OperationFinished)
  async finishOperation(@MessageBody() details: { id: string }): Promise<void> {
    await this.robotsService.finishOperation(details);
  }

  @Post('operations/:id/release')
  async release(@Param('id') operationId: string): Promise<void> {
    const robot = await this.robotsService.release(operationId);

    const client = this.getClientById(robot.id);
    client.emit(RobotEvent.Released);
  }

  @Post('operations/initiate')
  async initiateOperation(
    @Body() request: InitiateOperationDto,
  ): Promise<void> {
    const operation = await this.robotsService.initiateOperation(request);

    const client = this.getClientById(operation.robot.id);
    client.emit(RobotEvent.PathAccepted, operation.paths);
  }

  private getClientById(id: string): Socket {
    const client = this.clientsMap.get(id);

    if (!client) {
      throw new NotFoundException(`Robot with id ${id} not found.`);
    }

    return client;
  }
}
