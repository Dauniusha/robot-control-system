import { faker } from '@faker-js/faker';
import { type Agency, User, type UserDetails } from '../entities/user';
import { Auth } from '../auth';
import { UserRole } from '../entities/user-role';
import { UserStatus } from '../entities/user-status';
import { Gender } from '../entities/gender';
import { DomainLog, DomainLogType } from '../entities/domain-log';

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
