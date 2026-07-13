/** bcrypt adapter for the PasswordHasher port. */
import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../domain/ports';

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 12) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
