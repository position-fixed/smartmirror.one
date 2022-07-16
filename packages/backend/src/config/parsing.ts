import { join } from 'path';
import ms from 'ms';
import { randomUUID } from 'crypto';
import { stdout } from 'process';
import {
  PluginDefinition,
  WidgetConfig,
  WidgetDefinition,
} from '@smartmirror.one/types';


import { defaultWidget } from './defaults';
import { getConfigFile } from './fileHandling';
import { getFileContents, getJavascript } from './fileHandling';
import { LoadedConfig, ManifestContent } from '../types';

type ConfigWithoutRoot = Omit<LoadedConfig, 'rootFolder'>;

interface CollectPluginFilesProps {
  rootFolder: string;
  pluginReferences: string[];
}

export const collectPluginFiles = async ({
  rootFolder,
  pluginReferences,
}: CollectPluginFilesProps): Promise<PluginDefinition[]> => {
  const plugins: PluginDefinition[] = [];

  for (const pluginRef of pluginReferences) {
    const pluginFolder = join(rootFolder, 'plugins', pluginRef);
    const manifestContents = await getFileContents({
      rootFolder: pluginFolder,
      filenames: [ 'manifest.json' ],
    });
    const manifest = JSON.parse(manifestContents[0].toString()) as ManifestContent;

    checkManifestRequirements({ manifest, plugin: pluginRef });

    const plugin: PluginDefinition = { ...manifest, widgets: {}};
    for (const [ key, entry ] of Object.entries(manifest.widgets)) {
      const widgetFolder = join(pluginFolder, key);
      const frontendFolder = join(widgetFolder, 'frontend');
      const widget: WidgetDefinition = {
        ...manifest.widgets[key],
        backend: require(join(widgetFolder, 'backend.js')),
        css: await getFileContents({
          rootFolder: frontendFolder,
          filenames: entry.css,
        }),
        frontend: await getJavascript(join(frontendFolder, 'events')),
        html: await getFileContents({
          filenames: entry.html,
          rootFolder: frontendFolder,
        }),
      };

      if (widget.refreshRate) {
        widget.refreshRate = ms(widget.refreshRate.toString());
      }

      plugin.widgets[key] = widget;
    }

    plugins.push(plugin);
  }

  return plugins;
};

interface CheckManifestRequirementsProps {
  manifest: ManifestContent,
  plugin: string,
}
export const checkManifestRequirements = ({
  manifest,
  plugin,
}: CheckManifestRequirementsProps): void => {
  [ 'name', 'author', 'email' ].forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(manifest, key)) {
      throw new Error(`Property ${key} missing in ${plugin} manifest!`);
    }
  });
};

interface WidgetFilterProps {
  item: WidgetConfig,
  plugins: PluginDefinition[],
}

export const widgetFilter = ({
  item,
  plugins,
}: WidgetFilterProps): boolean => {
  const [ plugin, widget ] = item.widget.split('.');
  const foundPlugin = plugins.find(p => p.name === plugin);
  if (foundPlugin) {
    const expectedVars = foundPlugin.widgets[widget].variables || [];
    const varsValid = expectedVars.length > 0
      ? expectedVars.some(variable => {
        return Object.prototype.hasOwnProperty.call(item.inputs, variable.name)
          && typeof item.inputs[variable.name] === variable.type;
      })
      : true;
    if (varsValid) {
      return true;
    } else {
      stdout.write(`Dropping ${item.id} because the variables do not match requirements.`);
    }
  } else {
    stdout.write(`Dropping ${item.id} because the plugin cannot be found.`);
  }
  return false;
};

export const standardizeWidget = (widget: WidgetConfig): WidgetConfig => {
  const standardWidget: WidgetConfig = {
    ...widget,
    id: widget.id || randomUUID(),
  };

  if (widget.refreshRate) {
    if (typeof widget.refreshRate === 'number') {
      standardWidget.refreshRate = widget.refreshRate;
    }
    if (typeof widget.refreshRate === 'string') {
      standardWidget.refreshRate = ms(widget.refreshRate.toString());
    }
  }

  return standardWidget;
};

type ParseConfigResults = {
  checkedConfig: ConfigWithoutRoot,
  newEnvironment: boolean,
}

export const parseConfig = async (contentLocation: string): Promise<ParseConfigResults> => {
  const defaultWidgets = [ defaultWidget as WidgetConfig ];
  const { content, newEnvironment } = await getConfigFile(contentLocation);
  const checkedConfig:ConfigWithoutRoot = {
    boardSetup: {
      height: 10,
      testMode: false,
      width: 10,
      ...(content?.boardSetup || {}),
    },
    port: content?.port || 3000,
    widgets: (content?.widgets || defaultWidgets).map(standardizeWidget),
  };

  return { checkedConfig, newEnvironment };
};

export const dedupeWidgets = (list: string[], item: WidgetConfig) => {
  const plugin = item.widget.split('.')[0];
  return list.includes(plugin) ? list : [ ...list, plugin ];
};