export enum Client2Server {
  requestSetup = 'requestSetup',
  requestMethod = 'requestMethod',
}

export enum Server2Client {
  connect = 'connect',
  setup = 'setup',
  widgetUpdate = 'widgetUpdate',
}

export type ClientMessage = keyof typeof Client2Server;
export type ServerMessage = keyof typeof Server2Client;

export interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type WidgetVariables = {
  name: string;
  type: 'string' | 'number' | 'boolean';
};

export type WidgetDefinition = {
  refreshRate?: string | number;
  html: string[];
  css: string[];
  frontend: Record<string, string>;
  backend: Record<string, (data?: Record<string, unknown>) => Promise<Record<string, unknown>>>;
  variables?: WidgetVariables[];
};

export type PluginDefinition = {
  name: string;
  author: string;
  email: string;
  widgets: Record<string, WidgetDefinition>;
};

export type WidgetConfig = {
  plugin: string;
  widget: string;
  id: string;
  refreshRate?: string | number;
  position: Position;
  inputs: Record<string, unknown>;
  data: Record<string, unknown>;
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