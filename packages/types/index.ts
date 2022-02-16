export enum Client2Server {
  requestSetup = 'requestSetup',
};
export enum Server2Client {
  connect = 'connect',
  setup = 'setup',
  elementUpdate = 'elementUpdate',
};

export type ClientMessage = keyof typeof Client2Server;
export type ServerMessage = keyof typeof Server2Client;

export interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type MirrorElement = {
  position: Position;
  content: string;
}

export type MirrorSetup = {
  width: number;
  height: number;
  testMode: boolean;
}