/**
 * Composition root — wires modules together. The monolith is stateless and
 * scales horizontally (Vol 6 §5.1). Module boundaries are enforced by folder
 * convention: modules never import each other's internals, only shared
 * infrastructure and the event bus.
 */
import express, { type Express } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { loadConfig, type AppConfig } from './shared/config';
import { createLogger } from './shared/logger';
import { InProcessEventBus } from './shared/event-bus';
import { AuthService } from './modules/identity-auth/application/auth-service';
import { BcryptPasswordHasher } from './modules/identity-auth/infrastructure/bcrypt-password-hasher';
import { JwtTokenIssuer } from './modules/identity-auth/infrastructure/jwt-token-issuer';
import {
  PostgresRefreshTokenRepository,
  PostgresUserRepository,
} from './modules/identity-auth/infrastructure/postgres-repositories';
import { HealthGraphService } from './modules/health-graph/application/health-graph-service';
import { PostgresFhirResourceRepository } from './modules/health-graph/infrastructure/postgres-resource-repository';
import { TimelineService } from './modules/timeline/application/timeline-service';
import { PostgresTimelineRepository } from './modules/timeline/infrastructure/postgres-timeline-repository';
import { createAuthMiddleware } from './http/middleware/auth';
import { createErrorHandler } from './http/middleware/error-handler';
import { createAuthRoutes } from './http/routes/auth-routes';
import { createFhirRoutes } from './http/routes/fhir-routes';
import { createTimelineRoutes } from './http/routes/timeline-routes';

export interface AppContext {
  app: Express;
  pool: Pool;
  redis: Redis;
  config: AppConfig;
}

export function createApp(config: AppConfig = loadConfig()): AppContext {
  const logger = createLogger('gaia-api');
  const pool = new Pool({ connectionString: config.databaseUrl });
  // Redis: session/rate-limit/cache layer (Vol 6 §6.6). Lazy connect so unit
  // paths that never touch cache don't require a running Redis.
  const redis = new Redis(config.redisUrl, { lazyConnect: true });

  const eventBus = new InProcessEventBus(logger);

  // Identity & Auth module
  const tokenIssuer = new JwtTokenIssuer(
    config.jwtSecret,
    config.jwtAccessTtlSeconds,
    config.jwtRefreshTtlSeconds,
  );
  const authService = new AuthService(
    new PostgresUserRepository(pool),
    new PostgresRefreshTokenRepository(pool),
    new BcryptPasswordHasher(),
    tokenIssuer,
    eventBus,
  );

  // Health Graph module
  const healthGraphService = new HealthGraphService(
    new PostgresFhirResourceRepository(pool),
    eventBus,
  );

  // Timeline module — registers its projection on the event backbone.
  const timelineService = new TimelineService(new PostgresTimelineRepository(pool), eventBus);
  timelineService.registerProjections();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gaia-api' });
  });

  const requireAuth = createAuthMiddleware(tokenIssuer);
  app.use('/auth', createAuthRoutes(authService));
  app.use('/fhir', requireAuth, createFhirRoutes(healthGraphService));
  app.use('/timeline', requireAuth, createTimelineRoutes(timelineService));

  app.use(createErrorHandler(logger));

  return { app, pool, redis, config };
}
