import { createServer, Server as HttpServer } from 'http';
import { join } from 'path';
import { Server as FileServer } from 'node-static';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage, ServerResponse } from 'http';

import { Config } from './config';

type ClientMessage = { action: string, payload: Record<string, any> };

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
    console.log(`Server is online!`);
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
          payload: this.config.boardSetup,
        }));
        conn.send(JSON.stringify({
          action: 'elementUpdate',
          payload: this.config.elements,
        }));
    }
  }

  private async fileListener(req: IncomingMessage, res: ServerResponse) {
    req.addListener('end', () => {
      this.fileServer.serve(req, res).addListener('error', (err) => {
        console.error("Error serving " + req.url + " - " + err.message);
      });
    });
    req.resume();
  }
}