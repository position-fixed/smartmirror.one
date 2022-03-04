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

export type WidgetDefinition = {
  html: string[];
  css: string[];
  frontend: Record<string, string>;
  backend: unknown;
  variables: {
    name: string;
    type: 'string' | 'number' | 'boolean';
  }[];
};

export type PluginDefinition = {
  name: string;
  author: string;
  email: string;
  widgets: Record<string, WidgetDefinition>;
};

export type WidgetConfig = {
  widget: string;
  id: string;
  position: Position;
  inputs: Record<string, any>;
}

export type BoardSetup = {
  width: number;
  height: number;
  testMode: boolean;
}

export type MirrorSetup = {
  boardSetup: BoardSetup;
  widgets: WidgetConfig[];
  plugins: PluginDefinition[];
}