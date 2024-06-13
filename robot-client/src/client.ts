import * as process from 'node:process';
import { type Socket, io } from 'socket.io-client';
import { type Traversal, type Path } from './types';

export class Client {
  private readonly socket: Socket;
  private readonly traversal: Traversal;

  constructor(TraversalAlgorithm: new (socket: Socket) => Traversal) {
    this.socket = io(`${process.env.SERVER_URL}?id=${process.env.ROBOT_ID}`);

    this.traversal = new TraversalAlgorithm(this.socket);

    this.socket.on('connect', async () => {
      console.log('Robot connected');

      this.socket.on('path_accepted', async (paths: Path[]) => {
        for (const path of paths) {
          const targetPoint = path[path.length - 1]; // eslint-disable-line unicorn/prefer-at

          await this.traversal.traversePath(path); // eslint-disable-line no-await-in-loop

          this.socket.emit('target_point_reached', { point: targetPoint });
          await this.released(); // eslint-disable-line no-await-in-loop
        }

        const details = {};
        this.socket.emit('operation_finished', details);
        console.log('Operation finished');
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Robot disconnected');
    });

    this.socket.on('connect_error', (error) => {
      throw new Error(`connect_error due to ${error.message}`);
    });
  }

  private async released(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.on('released', resolve);
    });
  }
}
