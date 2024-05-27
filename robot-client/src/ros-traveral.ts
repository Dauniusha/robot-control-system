import ros from 'rosnodejs';
import type Publisher from 'rosnodejs/dist/lib/Publisher';
import type NodeHandle from 'rosnodejs/dist/lib/NodeHandle';
import { type Socket } from 'socket.io-client';
import {
  type OdometryMessage,
  type PositionDetails,
  type RosVelocityMessage,
  type Path,
  type Traversal,
} from './types';

export class RosTraversal implements Traversal {
  private handle?: NodeHandle;
  private cmdVelPublisher?: Publisher<RosVelocityMessage>;

  constructor(private readonly socket: Socket) {}

  async traversePath(path: Path) {
    if (!this.handle || !this.cmdVelPublisher) {
      await this.init();
    }

    let point = path.shift();

    return new Promise<void>((resolve) => {
      this.handle?.subscribe<OdometryMessage>(
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
            this.socket.emit('point_reached', { point });
            point = path.shift();
            if (!point) {
              void this.handle?.unsubscribe('/odom');
              this.cmdVelPublisher!.publish({
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

          const { linear, angular } = this.calculateVelocities(
            currentPosition,
            targetPosition,
          );

          const twist: RosVelocityMessage = {
            linear: { x: linear, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: angular },
          };
          this.cmdVelPublisher?.publish(twist);
        },
      );
    });
  }

  private async init() {
    this.handle = await ros.initNode('/main_node');
    this.cmdVelPublisher = this.handle.advertise<unknown>(
      '/cmd_vel',
      'geometry_msgs/Twist',
      {
        queue_size: 10, // eslint-disable-line @typescript-eslint/naming-convention
      },
    ) as Publisher<RosVelocityMessage>;
  }

  private calculateVelocities(
    currentPosition: PositionDetails,
    targetPosition: PositionDetails,
  ) {
    const linear = 0.5;
    const angular = 0.2 * (targetPosition.theta - currentPosition.theta);
    return { linear, angular };
  }
}
