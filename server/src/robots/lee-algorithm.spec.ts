import { Coordinate } from '../core/entities/schema';
import { findPath } from './lee-algorithm';

describe('Lee Algorithm', () => {
  it('should return find best path', () => {
    const field = [
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 1, 0, 1],
      [0, 1, 0, 0],
    ];

    const start = new Coordinate(0, 0);
    const end = new Coordinate(3, 3);

    const bestPath = findPath(field, start, end);

    expect(bestPath).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ]);
  });
});
