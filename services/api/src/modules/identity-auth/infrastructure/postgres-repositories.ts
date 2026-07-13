/**
 * PostgreSQL adapters for Identity & Auth ports (Vol 6 §6.2).
 */
import type { Pool } from 'pg';
import type { UserRole } from '@gaia/shared-types';
import type { RefreshTokenRepository, StoredUser, UserRepository } from '../domain/ports';

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  role: UserRole;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

function toStoredUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    const row = result.rows[0];
    return row ? toStoredUser(row) : null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    const row = result.rows[0];
    return row ? toStoredUser(row) : null;
  }

  async create(user: StoredUser): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, email, first_name, role, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, user.email, user.firstName, user.role, user.passwordHash, user.createdAt, user.updatedAt],
    );
  }
}

export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly pool: Pool) {}

  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.pool.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, userId, expiresAt],
    );
  }

  async findUserId(token: string): Promise<string | null> {
    const result = await this.pool.query<{ user_id: string }>(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() AND revoked_at IS NULL',
      [token],
    );
    return result.rows[0]?.user_id ?? null;
  }

  async revoke(token: string): Promise<void> {
    await this.pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1', [token]);
  }
}
