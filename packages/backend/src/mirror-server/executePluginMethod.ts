import { Config } from '../types';

interface ExecutePluginMethodProps {
  config: Config;
  methodName: string;
  widgetId: string;
  data: Record<string, unknown>;
}

export const executePluginMethod = ({
  config,
  methodName,
  widgetId,
  data,
}: ExecutePluginMethodProps): Record<string, unknown> | null => {
  const widgetConfig = config.widgets.find(w => w.id === widgetId);

  if (widgetConfig) {
    const [ plugin, widget ] = widgetConfig.widget.split('.');
    const methods = config.plugins.find(p => p.name === plugin)?.widgets[widget].backend;
    if (methods && Object.prototype.hasOwnProperty.call(methods, methodName)) {
      return methods[methodName](data);
    }
  }

  return null;
};