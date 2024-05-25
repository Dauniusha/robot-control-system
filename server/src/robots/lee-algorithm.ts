import { Coordinate } from '../core/entities/schema';

export function findPath(
  field: number[][],
  start: Coordinate,
  end: Coordinate,
): Coordinate[] {
  const rows = field.length;
  const cols = field[0].length;
  const visited = Array.from({ length: rows }).map(() =>
    Array.from({ length: cols }, () => false),
  );
  const queue: Coordinate[] = [];
  const parent: Array<Array<Coordinate | undefined>> = Array.from({
    length: rows,
  }).map(() => Array.from({ length: cols }, () => undefined));

  visited[start.y][start.x] = true;
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === end.x && current.y === end.y) {
      break;
    }

    const neighbors = getNeighbors(field, current, rows, cols);

    for (const neighbor of neighbors) {
      if (!visited[neighbor.y][neighbor.x]) {
        visited[neighbor.y][neighbor.x] = true;
        parent[neighbor.y][neighbor.x] = current;
        queue.push(neighbor);
      }
    }
  }

  return reconstructPath(parent, end);
}

function getNeighbors(
  field: number[][],
  current: Coordinate,
  rows: number,
  cols: number,
) {
  const neighbors: Coordinate[] = [];
  const deltas: Coordinate[] = [
    new Coordinate(-1, 0),
    new Coordinate(0, 1),
    new Coordinate(1, 0),
    new Coordinate(0, -1),
  ];

  for (const delta of deltas) {
    const nextX = current.x + delta.x;
    const nextY = current.y + delta.y;

    const inField = nextX >= 0 && nextX < rows && nextY >= 0 && nextY < cols;

    if (inField && field[nextY][nextX] !== 1) {
      neighbors.push({ x: nextX, y: nextY });
    }
  }

  return neighbors;
}

function reconstructPath(
  parent: Array<Array<Coordinate | undefined>>,
  end: Coordinate,
) {
  const path: Coordinate[] = [];
  let current: Coordinate | undefined = end;

  while (current !== undefined) {
    path.unshift(current);
    current = parent[current.y][current.x];
  }

  return path;
}
