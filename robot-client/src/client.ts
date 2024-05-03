import * as process from 'node:process';
import { io } from 'socket.io-client';

const socket = io(process.env.SERVER_URL);

type Point = { x: number; y: number };
type Path = Point[];

socket.on('connect', () => {
  console.log('Robot connected');

  socket.on('path_accepted', async (paths: Path[]) => {
    for (const path of paths) {
      traversePath(path);

      const targetPoint = path.pop();
      socket.emit('target_point_reached', { point: targetPoint });
      await releaseCompleted(); // eslint-disable-line no-await-in-loop
    }

    const details = {};
    socket.emit('target_point_reached', details);
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

function moveRobotToPoint(point: Point) {
  // Not implemented
}

function releaseCompleted(): Promise<void> {
  return new Promise((resolve) => {
    socket.on('release_complited', resolve);
  });
}
