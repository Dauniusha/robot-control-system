import { SortDirections } from '../src/core/utils/sort';
import { PrismaClient, type Prisma } from './generated';

export class PrismaService {
  static convertSortType(sort: SortDirections): Prisma.SortOrder {
    return sort === SortDirections.Asc ? 'asc' : 'desc';
  }

  readonly createTransaction: typeof this.prismaClient.$transaction;

  private readonly prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();

    this.createTransaction = this.prismaClient.$transaction.bind(
      this.prismaClient,
    );
  }

  get client(): PrismaClient {
    return this.prismaClient;
  }
}
