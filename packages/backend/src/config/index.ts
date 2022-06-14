import { dump } from 'js-yaml';
import { exit } from 'process';
import { homedir } from 'os';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

import { Config } from '../types';
import { prepPluginEnvironment } from './fileHandling';
import {
  collectPluginFiles,
  dedupeWidgets,
  parseConfig,
  widgetFilter,
} from './parsing';

export const getConfig = async (): Promise<Config> => {
  try {
    const rootFolder = join(homedir(), '.smartmirror');
    const contentLocation = join(rootFolder, 'config.yml');
    const {
      checkedConfig,
      newEnvironment,
    } = await parseConfig(contentLocation);

    const newYaml = dump(checkedConfig);
    await mkdir(rootFolder, { recursive: true });
    await writeFile(contentLocation, newYaml);

    const pluginReferences: string[] = checkedConfig.widgets
      .reduce(dedupeWidgets, [] as string[]);

    if (newEnvironment) {
      await prepPluginEnvironment(rootFolder);
    }

    const plugins = await collectPluginFiles({ rootFolder, pluginReferences });
    const checkedWidgets = checkedConfig.widgets
      .filter(item => widgetFilter({ item, plugins }));

    const config: Config = {
      ...checkedConfig,
      plugins,
      rootFolder,
      widgets: checkedWidgets,
    };

    return config;
  } catch(e) {
    console.error(e);
    exit();
  }
};