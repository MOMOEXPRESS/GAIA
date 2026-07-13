/**
 * JWT authentication middleware — every request beyond /auth requires a valid
 * access token; roles are read from claims (Vol 5 §14, Vol 6 §5.4).
 */
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@gaia/shared-types';
import { UnauthorizedError } from '../../shared/errors';
import type { JwtTokenIssuer } from '../../modules/identity-auth/infrastructure/jwt-token-issuer';

export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; role: UserRole };
}

export function createAuthMiddleware(tokenIssuer: JwtTokenIssuer) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError());
      return;
    }
    try {
      req.auth = tokenIssuer.verifyAccessToken(header.slice('Bearer '.length));
      next();
    } catch {
      next(new UnauthorizedError('Your session has expired. Please sign in again.'));
    }
  };
}
