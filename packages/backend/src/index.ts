import { Server } from './server';
import { getConfig } from './config';

(async () => {
  const config = await getConfig();
  new Server(config);
})();