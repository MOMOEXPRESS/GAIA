/**
 * Minimal forward-only migration runner (Vol 6 §12.5: backward-compatible,
 * expand-and-contract migrations; rollbacks are avoided — code is
 * forward-compatible).
 *
 * Usage: npm run migrate  (reads DATABASE_URL)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { loadConfig } from '../src/shared/config';
import { createLogger } from '../src/shared/logger';

async function migrate(): Promise<void> {
  const logger = createLogger('gaia-migrate');
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = join(__dirname, '..', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
    if (applied.rowCount && applied.rowCount > 0) {
      logger.info('skipping applied migration', { file });
      continue;
    }
    const sql = readFileSync(join(dir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info('applied migration', { file });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  await pool.end();
  logger.info('migrations complete');
}

migrate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
