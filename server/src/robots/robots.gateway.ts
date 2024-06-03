import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotFoundException } from '@nestjs/common';
import { Coordinate } from '../core/entities/schema';
import { RobotEvent, RobotsService } from './robots.service';

type SocketWithId = Socket & { handshake: { query: { id: string } } };

@WebSocketGateway()
export class RobotsGateway implements OnGatewayConnection {
  static flushMessages(robotId: string) {
    const socket = RobotsGateway.clientsMap.get(robotId);
    console.log(socket?.messages);
    if (socket?.messages) socket.messages = [];
  }

  static getClientMessages(id: string) {
    const client = this.getClientById(id);

    return client.messages;
  }

  static emit(
    id: string,
    event: RobotEvent,
    payload: Record<string, any> = {},
  ) {
    const client = this.getClientById(id);

    client.socket.emit(event, payload);
    client.messages.push({ message: event, createdAt: new Date(), payload });
  }

  private static readonly clientsMap = new Map<
    string,
    {
      socket: Socket;
      messages: Array<{
        message: string;
        createdAt: Date;
        payload: Record<string, any>;
      }>;
    }
  >();

  private static getClientById(id: string) {
    const client = this.clientsMap.get(id);

    if (!client) {
      throw new NotFoundException(`Socket for robot with id ${id} not found.`);
    }

    return client;
  }

  private static trackMessage(
    socket: SocketWithId,
    message: string,
    payload: Record<string, any>,
  ) {
    const client = RobotsGateway.clientsMap.get(socket.handshake.query.id);

    if (!client) return;

    client.messages.push({ message, createdAt: new Date(), payload });
  }

  @WebSocketServer()
  server!: Server;

  constructor(private readonly robotsService: RobotsService) {}

  @SubscribeMessage(RobotEvent.PointReached)
  async reachPoint(
    @ConnectedSocket() client: SocketWithId,
    @MessageBody('point') point: Coordinate,
  ): Promise<void> {
    await this.robotsService.reachPoint(client.handshake.query.id, point);
    RobotsGateway.trackMessage(client, RobotEvent.PointReached, {
      point,
    });
  }

  @SubscribeMessage(RobotEvent.TargetPointReached)
  async reachTargetPoint(
    @ConnectedSocket() client: SocketWithId,
    @MessageBody('point') point: Coordinate,
  ): Promise<void> {
    await this.robotsService.reachTargetPoint(client.handshake.query.id, point);
    RobotsGateway.trackMessage(client, RobotEvent.TargetPointReached, {
      point,
    });
  }

  @SubscribeMessage(RobotEvent.OperationFinished)
  async finishOperation(
    @ConnectedSocket() client: SocketWithId,
    @MessageBody() details: { id: string },
  ): Promise<void> {
    await this.robotsService.finishOperation(
      client.handshake.query.id,
      details,
    );
    RobotsGateway.trackMessage(client, RobotEvent.OperationFinished, details);
  }

  handleConnection(client: SocketWithId) {
    RobotsGateway.clientsMap.set(client.handshake.query.id, {
      socket: client,
      messages: [],
    });
  }
}
