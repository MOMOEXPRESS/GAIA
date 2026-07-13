/**
 * Configuration — validated at boot so misconfiguration fails fast.
 */
import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().default(4000),
  databaseUrl: z.string().default('postgres://gaia:gaia@localhost:5432/gaia'),
  redisUrl: z.string().default('redis://localhost:6379'),
  jwtSecret: z.string().min(8),
  jwtAccessTtlSeconds: z.coerce.number().default(900),
  jwtRefreshTtlSeconds: z.coerce.number().default(2_592_000),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse({
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    jwtSecret: env.JWT_SECRET ?? 'dev-secret-change-me',
    jwtAccessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
    jwtRefreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
  });
}
