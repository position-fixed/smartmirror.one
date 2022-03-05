import { getConfig } from './config';
import { Server } from './server';

(async () => {
  const config = await getConfig();
  new Server(config);
})();