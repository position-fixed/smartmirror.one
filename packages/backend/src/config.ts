import { exit } from 'process';
import { homedir } from 'os';
import { join } from 'path';
import ms from 'ms';
import { randomUUID } from 'crypto';
import {
  BoardSetup,
  PluginDefinition,
  WidgetConfig,
} from '@smartmirror.one/types';
import { dump, load } from 'js-yaml';
import { readdir, readFile, writeFile } from 'fs/promises';

type LoadedConfig = {
  port: number;
  rootFolder: string;
  boardSetup: BoardSetup;
  widgets: WidgetConfig[];
}

export type Config = LoadedConfig & {
  plugins: PluginDefinition[];
}

const getFileContents = async ({
  rootFolder,
  filenames,
}: { rootFolder: string, filenames: string[] }): Promise<string[]> => {
  const output: string[] = [];
  for (const file of filenames) {
    const filePath = join(rootFolder, file);
    const fileContent = await readFile(filePath);
    output.push(fileContent.toString());
  }
  return output;
};

const getJavascript = async (rootFolder: string): Promise<Record<string, string>> => {
  const folderContents = await readdir(rootFolder, { withFileTypes: true });
  const filenames = folderContents
    .filter(file => file.isFile())
    .filter(file =>  /.js$/.test(file.name))
    .map(file => file.name);

  const results: Record<string, string> = {};
  for (const file of filenames) {
    const fileContent = await readFile(join(rootFolder, file), 'utf-8');
    results[file.replace(/.js$/, '')] = fileContent.toString();
  }
  return results;
};

const parsePlugins = async ({
  rootFolder,
  pluginReferences,
}: { rootFolder: string, pluginReferences: string[] }): Promise<PluginDefinition[]> => {
  const plugins: PluginDefinition[] = [];
  for (const plugin of pluginReferences) {
    const pluginFolder = join(rootFolder, plugin);
    const manifestContents = await getFileContents({
      rootFolder: pluginFolder,
      filenames: [ 'manifest.json' ],
    });
    const manifest = JSON.parse(manifestContents[0].toString()) as PluginDefinition;

    [ 'name', 'author', 'email' ].forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(manifest, key)) {
        throw new Error(`Property ${key} missing in ${plugin} manifest!`);
      }
    });

    for (const [ key, entry ] of Object.entries(manifest.widgets)) {
      const widgetFolder = join(pluginFolder, key);
      const frontendFolder = join(widgetFolder, 'frontend');
      const widget = manifest.widgets[key];
      widget.css = await getFileContents({
        rootFolder: frontendFolder,
        filenames: entry.css,
      });

      widget.html = await getFileContents({
        rootFolder: frontendFolder,
        filenames: entry.html,
      });

      widget.frontend = await getJavascript(join(frontendFolder, 'events'));
      widget.backend = require(join(widgetFolder, 'backend.js'));

      if (widget.refreshRate) {
        widget.refreshRate = ms(widget.refreshRate.toString());
      }

      plugins.push(manifest);
    }
  }

  return plugins;
};

const filterWidgets = ({
  item,
  plugins,
}: { item: WidgetConfig, plugins: PluginDefinition[] }): boolean => {
  const [ plugin, widget ] = item.widget.split('.');
  const foundPlugin = plugins.find(p => p.name === plugin);
  if (foundPlugin) {
    const expectedVars = foundPlugin.widgets[widget].variables;
    const varsCheck = expectedVars.find(variable => {
      return Object.prototype.hasOwnProperty.call(item.inputs, variable.name)
        && typeof item.inputs[variable.name] === variable.type;
    });
    if (varsCheck) {
      return true;
    } else {
      console.log(`Dropping ${item.id} because the variables do not match requirements.`);
    }
  } else {
    console.log(`Dropping ${item.id} because the plugin cannot be found.`);
  }
  return false;
};

const standardizeWidget = (widget: WidgetConfig): WidgetConfig => {
  widget.id = widget.id || randomUUID();
  if (widget.refreshRate) {
    widget.refreshRate = ms(widget.refreshRate.toString());
  }
  return widget;
};

export const getConfig = async (): Promise<Config> => {
  try {
    const rootFolder = join(homedir(), '.smartmirror');
    const contentLocation = join(rootFolder, 'config.yml');
    const contentFile = await readFile(contentLocation, 'utf-8');
    const content = load(contentFile) as Partial<LoadedConfig>;
    const newContent: LoadedConfig = {
      boardSetup: {
        height: 10,
        testMode: false,
        width: 10,
        ...content.boardSetup,
      },

      port: content.port || 3000,
      rootFolder,
      widgets: (content.widgets || []).map(standardizeWidget),
    };
    const newYaml = dump(content);
    await writeFile(contentLocation, newYaml);

    const pluginReferences: string[] = newContent.widgets.reduce((list, item) => {
      const plugin = item.widget.split('.')[0];
      return list.includes(plugin) ? list : [ ...list, plugin ];
    }, [] as string[]);

    const plugins = await parsePlugins({ rootFolder, pluginReferences });
    const checkedWidgets = newContent.widgets.filter(item => filterWidgets({ item, plugins }));

    const config: Config = {
      ...newContent,
      plugins,
      widgets: checkedWidgets,
    };

    return config;
  } catch(e) {
    console.error(e);
    exit();
  }
};