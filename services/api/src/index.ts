import { createApp } from './app';
import { createLogger } from './shared/logger';

const logger = createLogger('gaia-api');
const { app, config } = createApp();

app.listen(config.port, () => {
  logger.info('gaia-api listening', { port: config.port });
});
