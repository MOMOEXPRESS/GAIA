/**
 * JWT adapter for the TokenIssuer port. HS256 for the dev monolith; production
 * moves to asymmetric keys via the identity provider (Vol 6 §5.4).
 */
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@gaia/shared-types';
import type { TokenIssuer } from '../domain/ports';

export class JwtTokenIssuer implements TokenIssuer {
  constructor(
    private readonly secret: string,
    public readonly accessTtlSeconds: number,
    public readonly refreshTtlSeconds: number,
  ) {}

  issueAccessToken(userId: string, role: UserRole): string {
    return jwt.sign({ role }, this.secret, {
      subject: userId,
      expiresIn: this.accessTtlSeconds,
      algorithm: 'HS256',
    });
  }

  issueRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  verifyAccessToken(token: string): { userId: string; role: UserRole } {
    const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.role !== 'string') {
      throw new Error('Malformed token');
    }
    return { userId: decoded.sub, role: decoded.role as UserRole };
  }
}
