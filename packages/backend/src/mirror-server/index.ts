import { WebSocketServer } from 'ws';
import {
  createServer,
  Server as HttpServer,
} from 'http';

import { Config } from '../types';
import { connectHandlers } from './socketHandling';

export const startMirrorServer = async (config: Config) => {
  const mirrorIndex: string = Buffer
    .from(require('../../_public/index.js'), 'base64')
    .toString('utf-8');
  const httpServer: HttpServer = createServer((req, res) => {
    req.addListener('end', () => { res.end(mirrorIndex); });
    req.resume();
  });

  const socketServer = new WebSocketServer({ server: httpServer });
  socketServer.on('connection', (socket) => connectHandlers({ config, socket }));

  httpServer.listen(config.port);
  console.log(`Server is online at http://localhost:${config.port}`);
};
