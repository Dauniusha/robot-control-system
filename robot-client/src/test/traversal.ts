import { type Socket } from 'socket.io-client';
import { type Path, type Traversal } from '../types';

export class TestTraversal implements Traversal {
  constructor(private readonly socket: Socket) {}

  async traversePath(path: Path) {
    for (const point of path) {
      console.log(point);
      await this.moveRobotToPoint(); // eslint-disable-line no-await-in-loop
      this.socket.emit('point_reached', { point });
    }
  }

  private async moveRobotToPoint(): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, Math.random() * 6000);
    });
  }
}
