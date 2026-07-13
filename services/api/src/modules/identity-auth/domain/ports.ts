/**
 * Identity & Auth — domain ports (hexagonal architecture, Vol 6 §5.5).
 * The domain defines interfaces; infrastructure provides adapters.
 */
import type { TokenPair, User, UserRole } from '@gaia/shared-types';

export interface StoredUser extends User {
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(user: StoredUser): Promise<void>;
}

export interface RefreshTokenRepository {
  save(token: string, userId: string, expiresAt: Date): Promise<void>;
  findUserId(token: string): Promise<string | null>;
  revoke(token: string): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface TokenIssuer {
  issueAccessToken(userId: string, role: UserRole): string;
  issueRefreshToken(): string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

export type { TokenPair };
