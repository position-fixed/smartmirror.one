import { Config } from '../types';

interface ExecutePluginMethodProps {
  config: Config;
  methodName: string;
  widgetId: string;
  data: Record<string, unknown>;
}

export const executePluginMethod = async ({
  config,
  methodName,
  widgetId,
  data,
}: ExecutePluginMethodProps): Promise<Record<string, unknown> | null> => {
  const widgetConfig = config.widgets.find(w => w.id === widgetId);

  if (widgetConfig) {
    const methods = config.plugins
      .find(p => p.name === widgetConfig.plugin)?.widgets[widgetConfig.widget].backend;
    if (methods && Object.prototype.hasOwnProperty.call(methods, methodName)) {
      const result = await methods[methodName]({
        data,
        inputs: widgetConfig.inputs,
      });
      return result;
    }
  }

  return null;
};