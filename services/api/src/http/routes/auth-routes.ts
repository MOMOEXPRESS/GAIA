/**
 * Auth routes — registration, login, refresh (Vol 6 §5.4).
 */
import { Router } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors';
import type { AuthService } from '../../modules/identity-auth/application/auth-service';

const registerSchema = z.object({
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
});

const loginSchema = z.object({ email: z.string(), password: z.string() });
const refreshSchema = z.object({ refreshToken: z.string() });

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  router.post('/register', async (req, res, next) => {
    try {
      const body = registerSchema.safeParse(req.body);
      if (!body.success) throw new ValidationError('Email, password, and first name are required.');
      const result = await authService.register(body.data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const body = loginSchema.safeParse(req.body);
      if (!body.success) throw new ValidationError('Email and password are required.');
      const result = await authService.login(body.data.email, body.data.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      const body = refreshSchema.safeParse(req.body);
      if (!body.success) throw new ValidationError('A refresh token is required.');
      const tokens = await authService.refresh(body.data.refreshToken);
      res.json({ tokens });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
