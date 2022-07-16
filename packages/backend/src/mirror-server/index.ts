import { join } from 'path';
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
    .from(require(join(__dirname, '../../_public/index.js')), 'base64')
    .toString('utf-8');
  const httpServer: HttpServer = createServer((req, res) => {
    req.addListener('end', () => { res.end(mirrorIndex); });
    req.resume();
  });

  for (const widget of config.widgets) {
    let widgetData = null;

    widgetData = await executePluginMethod({
      config,
      data: {},
      methodName: 'init',
      widgetId: widget.id,
    });

    if (widgetData === null) {
      widgetData = await executePluginMethod({
        config,
        data: {},
        methodName: 'update',
        widgetId: widget.id,
      });
    }

    widget.data = widgetData || {};
  }

  const socketServer = new WebSocketServer({ server: httpServer });
  socketServer.on('connection', (socket) => connectHandlers({ config, socket }));

  httpServer.listen(config.port);
  console.log(`Server is online at http://localhost:${config.port}`);
};
