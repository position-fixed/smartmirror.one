import type { Client2Server, Server2Client } from '@smartmirror.one/types';

type ServerMessage = {
  action: keyof typeof Server2Client,
  payload: Record<string, any>
};

type Listener = (payload?: Record<string, any>) => void;

export default class SocketServer {
  private server: string;
  private eventListeners: Record<string, Listener[]> = {};
  socket: WebSocket;

  constructor(server: string) {
    this.server = server;
    this.connectSocket();
  }

  connectSocket() {
    console.log('Connecting Socket');
    this.socket = new WebSocket(this.server);
    this.socket.addEventListener('open', () => this.handleSocketConn());
    this.socket.addEventListener('message', (ev) => this.handleSocketMsg(ev));
    this.socket.addEventListener('close', () => this.handleSocketClose());
    window.addEventListener('requestMethod', (ev: CustomEvent) => this.handleMethodRequest(ev));
  }

  private handleSocketConn() {
    console.log('Socket Connected');
    (this.eventListeners.connect || []).forEach(listener => listener());
  }

  private handleSocketMsg(ev: MessageEvent) {
    const { action, payload } = JSON.parse(ev.data) as ServerMessage;
    if (action === 'widgetUpdate') {
      window.dispatchEvent(new CustomEvent('widgetUpdate', { detail: payload }));
    } else {
      this.eventListeners[action].forEach(listener => listener(payload));
    }
  }

  private handleSocketClose() {
    console.log('Socket Closed, attempting reconnect');
    window.setTimeout(() => this.connectSocket(), 10000);
  }

  private handleMethodRequest(ev: CustomEvent) {
    this.send('requestMethod', ev.detail);
  }

  send(action: keyof typeof Client2Server, payload?: Record<string, any>) {
    this.socket.send(JSON.stringify({
      action,
      payload,
    }));
  }

  addEventListener(event: keyof typeof Server2Client, listener: Listener) {
    this.eventListeners[event] = [
      ...(this.eventListeners[event] || []),
      listener,
    ];
  }

  removeEventListener(event: keyof typeof Server2Client, listener: Listener) {
    const index = (this.eventListeners[event] || []).findIndex(listener);
    if (index !== -1) {
      const otherListeners = [...this.eventListeners[event]];
      otherListeners.splice(index, 1);
      this.eventListeners[event] = [...otherListeners];
    }
  }
}