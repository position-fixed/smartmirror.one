import type {
  Client2Server,
  MirrorSetup,
  Server2Client,
} from '@smartmirror.one/types';
import {
  createServer,
  Server as HttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import { WebSocket, WebSocketServer } from 'ws';

import { Config } from './config';

type ClientMessage = {
  action: keyof typeof Client2Server,
  payload: Record<string, unknown>,
};

type SendToFrontendProps = {
  action: keyof typeof Server2Client,
  conn: WebSocket,
  payload: Record<string, unknown>,
};

export class Server {
  private mirrorIndex: string;
  private httpServer: HttpServer;
  private socketServer: WebSocketServer;
  private config: Config;

  constructor(config: Config) {
    const mirrorIndex = Buffer.from(require('../_public/index.js'), 'base64');
    this.mirrorIndex = mirrorIndex.toString('utf-8');

    this.httpServer = createServer((req, res) => this.fileListener(req, res));
    this.socketServer = new WebSocketServer({ server: this.httpServer });
    this.config = config;

    this.socketServer.on('connection', (conn) => this.connectHandlers(conn));

    this.httpServer.listen(config.port);
    console.log(`Server is online at http://localhost:${config.port}`);
  }

  private connectHandlers(conn: WebSocket) {
    conn.on('message', (msg) => this.handleMessage(conn, msg.toString()));
  }

  private handleMessage(conn: WebSocket, msg: string) {
    const { action, payload } = JSON.parse(msg) as ClientMessage;
    switch (action) {
    case 'requestSetup':
      conn.send(JSON.stringify({
        action: 'setup',
        payload: {
          boardSetup: this.config.boardSetup,
          plugins: this.config.plugins,
          widgets: this.config.widgets,
        } as MirrorSetup,
      }));
      break;
    case 'requestMethod':
      this.executePluginMethod({
        conn,
        methodName: payload.method as string,
        widgetId: payload.id as string,
      });
      break;
    }
  }

  private executePluginMethod({
    conn,
    widgetId,
    methodName,
  }: { conn: WebSocket, widgetId: string, methodName: string }) {
    const widgetConfig = this.config.widgets.find(w => w.id === widgetId);
    if (widgetConfig) {
      const [ plugin, widget ] = widgetConfig.widget.split('.');
      const methods = this.config.plugins.find(p => p.name === plugin)?.widgets[widget].backend;
      if (methods && Object.prototype.hasOwnProperty.call(methods, methodName)) {
        this.sendToFrontend({
          action: 'widgetUpdate',
          conn,
          payload: {
            id: widgetId,
            update: methods[methodName](),
          },
        });
      }
    }
  }

  private sendToFrontend({
    action,
    conn,
    payload,
  }: SendToFrontendProps) {
    conn.send(
      JSON.stringify({ action, payload }),
    );
  }

  private async fileListener(req: IncomingMessage, res: ServerResponse) {
    req.addListener('end', () => {
      res.end(this.mirrorIndex);
    });
    req.resume();
  }
}