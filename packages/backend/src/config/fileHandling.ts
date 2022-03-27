import { join } from 'path';
import { load } from 'js-yaml';
import { readdir, readFile } from 'fs/promises';

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

export const getConfigFile = async (configLocation: string): Promise<Partial<LoadedConfig>> => {
  let content: Partial<LoadedConfig>;

  try {
    const contentFile = await readFile(configLocation, 'utf-8');
    content = load(contentFile) as Partial<LoadedConfig>;
  } catch (e) {
    content = {};
  }

  return content;
};