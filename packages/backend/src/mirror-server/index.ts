import { WebSocketServer } from 'ws';
import {
  createServer,
  Server as HttpServer,
} from 'http';

import { Config } from '../types';
import { connectHandlers } from './socketHandling';
import { executePluginMethod } from './executePluginMethod';

export const startMirrorServer = async (config: Config) => {
  const mirrorIndex: string = Buffer
    .from(require('../../_public/index.js'), 'base64')
    .toString('utf-8');
  const httpServer: HttpServer = createServer((req, res) => {
    req.addListener('end', () => { res.end(mirrorIndex); });
    req.resume();
  });

  for (const widget of config.widgets) {
    const data = executePluginMethod({
      config,
      data: {},
      methodName: 'init',
      widgetId: widget.id,
    });
    widget.data = data || {};
  }

  const socketServer = new WebSocketServer({ server: httpServer });
  socketServer.on('connection', (socket) => connectHandlers({ config, socket }));

  httpServer.listen(config.port);
  console.log(`Server is online at http://localhost:${config.port}`);
};
