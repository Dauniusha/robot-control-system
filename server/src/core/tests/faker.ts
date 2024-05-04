import { faker } from '@faker-js/faker';

export class Faker {
  readonly base = faker;

  get standartUserEmail(): string {
    return 'test@test.com';
  }

  get randomTestUserEmail(): string {
    return `test+${faker.string.nanoid(4)}@test.com`;
  }

  get testEmailDbRegex(): string {
    return `test%@test.com`;
  }
}
