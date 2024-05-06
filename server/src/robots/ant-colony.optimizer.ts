class AntColonyOptimizer {
  private readonly distanceMatrix: number[][];
  private readonly smellCoef: number;
  private readonly distanceCoef: number;
  private readonly numCities: number;
  private readonly numAnts: number;
  private readonly numIterations: number;
  private readonly evaporationCoef: number;
  private readonly pheromoneMatrix: number[][];
  private bestPath: number[];
  private bestPathLength: number;

  constructor(parameters: {
    distanceMatrix: number[][];
    numberAnts?: number;
    numberIterations?: number;
    smellCoef?: number;
    distanceCoef?: number;
    evaporationCoef?: number;
  }) {
    this.distanceMatrix = parameters.distanceMatrix;
    this.smellCoef = parameters.smellCoef ?? 1;
    this.distanceCoef = parameters.distanceCoef ?? 5;
    this.numCities = parameters.distanceMatrix.length;
    this.numAnts = parameters.numberAnts ?? 30;
    this.numIterations = parameters.numberIterations ?? 100;
    this.evaporationCoef = parameters.evaporationCoef ?? 0.5;
    this.pheromoneMatrix = Array.from({ length: this.numCities }, () =>
      Array.from({ length: this.numCities }, () => 1),
    );
    this.bestPath = [];
    this.bestPathLength = Number.POSITIVE_INFINITY;
  }

  run(): [number[], number] {
    for (let i = 0; i < Math.floor(this.numIterations); i++) {
      const antPaths = this.constructAntPaths();
      this.updatePheromoneMatrix(antPaths);
      this.updateBestPath(antPaths);
    }

    return [this.bestPath, this.bestPathLength];
  }

  private constructAntPaths(): number[][] {
    const antPaths: number[][] = [];

    for (let i = 0; i < Math.floor(this.numAnts); i++) {
      const visited = Array.from({ length: this.numCities }, () => false);
      const path: number[] = [];
      let currentCity = Math.floor(Math.random() * this.numCities);

      while (path.length < this.numCities) {
        path.push(currentCity);
        visited[currentCity] = true;
        currentCity = this.selectNextCity(currentCity, visited);
      }

      antPaths.push(path);
    }

    return antPaths;
  }

  private selectNextCity(currentCity: number, visited: boolean[]): number {
    const unvisitedCitiesIndexes = visited
      .map((visited, index) => (visited ? null : index))
      .filter((index) => index !== null) as number[];

    if (unvisitedCitiesIndexes.length === 0) {
      // If there are no unvisited cities, choose a random city from the visited cities
      const visitedCitiesIndexes = visited.map((_, index) => index);
      return this.choiceRandom(visitedCitiesIndexes);
    }

    const pheromoneValues = unvisitedCitiesIndexes.map(
      (city) => this.pheromoneMatrix[currentCity][city],
    );
    const heuristicValues = unvisitedCitiesIndexes.map(
      (city) => 1 / this.distanceMatrix[currentCity][city],
    );
    const probabilities = pheromoneValues.map(
      (pheromone, index) =>
        pheromone ** this.smellCoef *
        heuristicValues[index] ** this.distanceCoef,
    );
    const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);
    const normalizedProbabilities = probabilities.map(
      (prob) => prob / totalProbability,
    );

    // Check if all probabilities are zero HOW?
    if (normalizedProbabilities.every((prob) => prob === 0)) {
      return this.choiceRandom(unvisitedCitiesIndexes);
    }

    return this.choiceRandom(unvisitedCitiesIndexes, normalizedProbabilities);
  }

  private choiceRandom<T>(choiceArray: T[], probabilities?: number[]): T {
    const randomValue = Math.random();

    if (!probabilities) {
      return choiceArray[Math.floor(randomValue * choiceArray.length)];
    }

    const cumulativeProbabilities: number[] = [];
    for (const probability of probabilities) {
      const previousProbability = cumulativeProbabilities.at(-1) ?? 0;
      cumulativeProbabilities.push(previousProbability + probability);
    }

    const index = cumulativeProbabilities.findIndex(
      (probability) => probability >= randomValue,
    );
    return choiceArray[index];
  }

  private updatePheromoneMatrix(antPaths: number[][]): void {
    for (let i = 0; i < this.numCities; i++) {
      for (let index = 0; index < this.numCities; index++) {
        this.pheromoneMatrix[i][index] *= 1 - this.evaporationCoef;
      }
    }

    for (const path of antPaths) {
      const pathLength = this.calculatePathLength(path);

      for (let i = 0; i < path.length - 1; i++) {
        const cityA = path[i];
        const cityB = path[i + 1];
        this.pheromoneMatrix[cityA][cityB] += 1 / pathLength;
      }
    }
  }

  private calculatePathLength(path: number[]): number {
    let length = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const cityA = path[i];
      const cityB = path[i + 1];
      length += this.distanceMatrix[cityA][cityB];
    }

    return length;
  }

  private updateBestPath(antPaths: number[][]): void {
    for (const path of antPaths) {
      const pathLength = this.calculatePathLength(path);

      if (pathLength < this.bestPathLength) {
        this.bestPath = path;
        this.bestPathLength = pathLength;
      }
    }
  }
}
