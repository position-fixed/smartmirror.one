import { Server as FileServer } from 'node-static';
import { join } from 'path';
import {
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

type ClientMessage = { action: Client2Server, payload: Record<string, unknown> };

export class Server {
  private httpServer: HttpServer;
  private fileServer: FileServer;
  private socketServer: WebSocketServer;
  private config: Config;

  constructor(config: Config) {
    this.fileServer = new FileServer(join(__dirname, '../_public'));
    this.httpServer = createServer(this.fileListener);
    this.socketServer = new WebSocketServer({ server: this.httpServer });
    this.config = config;

    this.socketServer.on('connection', (conn) => this.connectHandlers(conn));

    this.httpServer.listen(config.port);
    console.log('Server is online!');
  }

  private connectHandlers(conn: WebSocket) {
    conn.on('message', (msg) => this.handleMessage(conn, msg.toString()));
  }

  private handleMessage(conn: WebSocket, msg: string) {
    const { action, payload } = JSON.parse(msg) as ClientMessage;
    switch (action) {
    case Client2Server.requestSetup:
      conn.send(JSON.stringify({
        action: Server2Client.setup,
        payload: {
          boardSetup: this.config.boardSetup,
          plugins: this.config.plugins,
          widgets: this.config.widgets,
        } as MirrorSetup,
      }));
      break;
    case Client2Server.requestMethod:
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
        conn.send(JSON.stringify({
          action: Server2Client.widgetUpdate,
          payload: {
            id: widgetId,
            update: methods[methodName](),
          },
        }));
      }
    }
  }

  private async fileListener(req: IncomingMessage, res: ServerResponse) {
    req.addListener('end', () => {
      this.fileServer.serve(req, res).addListener('error', (err) => {
        console.error('Error serving ' + req.url + ' - ' + err.message);
      });
    });
    req.resume();
  }
}