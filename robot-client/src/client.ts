import * as process from 'node:process';
import { io } from 'socket.io-client';

const socket = io(`${process.env.SERVER_URL}?id=${process.env.ROBOT_ID}`);

type Coordinate = { x: number; y: number };
type Path = Coordinate[];

socket.on('connect', () => {
  console.log('Robot connected');

  socket.on('path_accepted', async (paths: Path[]) => {
    for (const path of paths) {
      traversePath(path);

      const targetPoint = path.pop();
      socket.emit('target_point_reached', { point: targetPoint });
      await released(); // eslint-disable-line no-await-in-loop
    }

    const details = {};
    socket.emit('operation_finished', details);
  });
});

socket.on('disconnect', () => {
  console.log('Robot disconnected');
});

function traversePath(path: Path) {
  for (const point of path) {
    moveRobotToPoint(point);
    socket.emit('point_reached', { point });
  }
}

function moveRobotToPoint(point: Coordinate) {
  throw new Error('Not implemented');
}

async function released(): Promise<void> {
  return new Promise((resolve) => {
    socket.on('released', resolve);
  });
}
