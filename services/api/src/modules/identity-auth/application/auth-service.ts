/**
 * Auth application service — registration, login, and refresh-token rotation.
 * Blueprint: Vol 6 §5.4 (Identity & Auth Service): short-lived access tokens
 * (15 min), long-lived refresh tokens (30 days), roles embedded in JWT claims.
 */
import { randomUUID } from 'node:crypto';
import type { TokenPair, User } from '@gaia/shared-types';
import { ConflictError, UnauthorizedError } from '../../../shared/errors';
import type { EventBus } from '../../../shared/event-bus';
import {
  assertValidEmail,
  assertValidFirstName,
  assertValidPassword,
} from '../domain/validation';
import type {
  PasswordHasher,
  RefreshTokenRepository,
  StoredUser,
  TokenIssuer,
  UserRepository,
} from '../domain/ports';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
    private readonly eventBus: EventBus,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    assertValidEmail(input.email);
    assertValidPassword(input.password);
    assertValidFirstName(input.firstName);

    const email = input.email.toLowerCase().trim();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const now = new Date().toISOString();
    const user: StoredUser = {
      id: randomUUID(),
      email,
      firstName: input.firstName.trim(),
      role: 'patient',
      passwordHash: await this.hasher.hash(input.password),
      createdAt: now,
      updatedAt: now,
    };
    await this.users.create(user);

    await this.eventBus.publish(
      'user.registered',
      user.id,
      { userId: user.id },
      'identity-auth',
    );

    return { user: this.toPublicUser(user), tokens: await this.issueTokens(user) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email.toLowerCase().trim());
    // Identical error for unknown email and wrong password — no account enumeration.
    const invalid = new UnauthorizedError('That email or password does not match our records.');
    if (!user) throw invalid;

    const ok = await this.hasher.verify(password, user.passwordHash);
    if (!ok) throw invalid;

    return { user: this.toPublicUser(user), tokens: await this.issueTokens(user) };
  }

  /** Refresh-token rotation: the presented token is revoked and a new pair issued. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    const userId = await this.refreshTokens.findUserId(refreshToken);
    if (!userId) {
      throw new UnauthorizedError('Your session has expired. Please sign in again.');
    }
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Your session has expired. Please sign in again.');
    }
    await this.refreshTokens.revoke(refreshToken);
    return this.issueTokens(user);
  }

  private async issueTokens(user: StoredUser): Promise<TokenPair> {
    const accessToken = this.tokens.issueAccessToken(user.id, user.role);
    const refreshToken = this.tokens.issueRefreshToken();
    const expiresAt = new Date(Date.now() + this.tokens.refreshTtlSeconds * 1000);
    await this.refreshTokens.save(refreshToken, user.id, expiresAt);
    return { accessToken, refreshToken, expiresIn: this.tokens.accessTtlSeconds };
  }

  private toPublicUser(user: StoredUser): User {
    const { passwordHash: _hash, ...publicUser } = user;
    return publicUser;
  }
}
