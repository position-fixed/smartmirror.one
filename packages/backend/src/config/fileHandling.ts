import { join } from 'path';
import { load } from 'js-yaml';
import { cp, mkdir, readdir, readFile } from 'fs/promises';

import { DEFAULT_PLUGIN } from './defaults';
import { LoadedConfig } from '../types';

export const getFileContents = async ({
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

export const getJavascript = async (rootFolder: string): Promise<Record<string, string>> => {
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

type ConfigFileResults = {
  content: Partial<LoadedConfig>,
  newEnvironment: boolean,
}

export const getConfigFile = async (configLocation: string): Promise<ConfigFileResults> => {
  let content: Partial<LoadedConfig>;
  let newEnvironment: boolean = false;

  try {
    const contentFile = await readFile(configLocation, 'utf-8');
    content = load(contentFile) as Partial<LoadedConfig>;
  } catch (e) {
    content = {};
    newEnvironment = true;
  }

  return { content, newEnvironment };
};

export const prepPluginEnvironment = async (rootFolder: string): Promise<void> => {
  const pluginFolder = join(rootFolder, DEFAULT_PLUGIN);
  const sourceLocation = join(__dirname, '../../_staging', DEFAULT_PLUGIN);
  await mkdir(pluginFolder, { recursive: true });
  await cp(sourceLocation, pluginFolder, { recursive: true, force: true });
};
