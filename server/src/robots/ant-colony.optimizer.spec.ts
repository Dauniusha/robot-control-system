import AntColonyOptimizer from './ant-colony.optimizer';

describe('Ant Colony Optimizer', () => {
  const distanceMatrix = [
    [0, 2, 5, 4],
    [2, 0, 3, 6],
    [5, 3, 0, 7],
    [4, 6, 7, 0],
  ];
  const basePosition = 3;

  it('should find best path', () => {
    const antOptimizer = new AntColonyOptimizer({
      distanceMatrix,
      distanceCoef: 2,
      smellCoef: 1,
      numberAnts: 5,
      numberIterations: 10,
      startPosition: basePosition,
      finishPosition: basePosition,
    });
    const [citiesPath, bestPathLength] = antOptimizer.run();

    expect(bestPathLength).toBe(16);
    expect(citiesPath[0]).toBe(basePosition);
    expect(citiesPath.at(-1)).toBe(basePosition);
  });
});
