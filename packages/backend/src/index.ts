import { getConfig } from './config';
import { startMirrorServer } from './mirror-server';

(async () => {
  const config = await getConfig();
  await startMirrorServer(config);
})();