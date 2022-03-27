import {
  BoardSetup,
  PluginDefinition,
  WidgetConfig,
  WidgetVariables,
} from '@smartmirror.one/types';

export type LoadedConfig = {
  port: number;
  rootFolder: string;
  boardSetup: BoardSetup;
  widgets: WidgetConfig[];
}

export type Config = LoadedConfig & {
  plugins: PluginDefinition[];
}

export type ManifestContent = Omit<PluginDefinition, 'widgets'> & {
  widgets: {
    [key: string]: {
      html: string[],
      css: string[],
      variables: WidgetVariables[]
    }
  }
}

/** TESTING */

type VoidFn = () => void;

type MockConfigInput = {
  frontend?: Record<string, VoidFn>,
  backend?: Record<string, VoidFn>,
};

export interface GlobalTest {
  getConfig: (input?: MockConfigInput) => Config;
}