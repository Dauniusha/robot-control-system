/* eslint-disable @typescript-eslint/no-floating-promises */
import * as process from 'node:process';
import { io } from 'socket.io-client';
import ros from 'rosnodejs';
import type Publisher from 'rosnodejs/dist/lib/Publisher';
import type NodeHandle from 'rosnodejs/dist/lib/NodeHandle';
import {
  type OdometryMessage,
  type Path,
  type PositionDetails,
  type RosVelocityMessage,
} from './types';

const socket = io(`${process.env.SERVER_URL}?id=${process.env.ROBOT_ID}`);

socket.on('connect', () => {
  console.log('Robot connected');

  ros.initNode('/main_node').then((handle) => {
    const cmdVelPublisher = handle.advertise<unknown>(
      '/cmd_vel',
      'geometry_msgs/Twist',
      {
        queue_size: 10, // eslint-disable-line @typescript-eslint/naming-convention
      },
    ) as Publisher<RosVelocityMessage>;

    socket.on('path_accepted', async (paths: Path[]) => {
      for (const path of paths) {
        const targetPoint = path.at(-1);

        await traversePath(path, handle, cmdVelPublisher); // eslint-disable-line no-await-in-loop

        socket.emit('target_point_reached', { point: targetPoint });
        await released(); // eslint-disable-line no-await-in-loop
      }

      const details = {};
      socket.emit('operation_finished', details);
    });
  });
});

socket.on('disconnect', () => {
  console.log('Robot disconnected');
});

async function traversePath(
  path: Path,
  handle: NodeHandle,
  cmdVelPublisher: Publisher<RosVelocityMessage>,
): Promise<void> {
  let point = path.shift();

  return new Promise<void>((resolve) => {
    handle.subscribe<OdometryMessage>(
      '/odom',
      'nav_msgs/Odometry',
      (message) => {
        if (!point) return;

        const currentPosition: PositionDetails = {
          x: message.pose.position.x,
          y: message.pose.position.y,
          theta: message.pose.orientation,
        };

        if (point.x === currentPosition.x && point.y === currentPosition.y) {
          socket.emit('point_reached', { point });
          point = path.shift();
          if (!point) {
            handle.unsubscribe('/odom');
            cmdVelPublisher.publish({
              linear: { x: 0, y: 0, z: 0 },
              angular: { x: 0, y: 0, z: 0 },
            });
            resolve();
            return;
          }
        }

        const targetPosition: PositionDetails = {
          x: point.x,
          y: point.y,
          theta: Math.atan2(
            point.y - currentPosition.y,
            point.x - currentPosition.x,
          ),
        };

        const { linear, angular } = calculateVelocities(
          currentPosition,
          targetPosition,
        );

        const twist: RosVelocityMessage = {
          linear: { x: linear, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: angular },
        };
        cmdVelPublisher.publish(twist);
      },
    );
  });
}

async function released(): Promise<void> {
  return new Promise((resolve) => {
    socket.on('released', resolve);
  });
}

function calculateVelocities(
  currentPosition: PositionDetails,
  targetPosition: PositionDetails,
) {
  const linear = 0.5;
  const angular = 0.2 * (targetPosition.theta - currentPosition.theta);
  return { linear, angular };
}
