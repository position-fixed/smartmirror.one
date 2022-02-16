import { readFile } from 'fs/promises';
import { load } from 'js-yaml';
import { homedir } from 'os';
import { join } from 'path';
import { exit } from 'process';

type Element = {
  position: {
    top: number,
    left: number,
    width: number,
    height: number,
  },
  content: string,
 };

export type Config = {
  port: number;
  boardSetup: {
    width: number,
    height: number,
    testMode: boolean,
  },
  elements: Element[]
}

export const getConfig = async (): Promise<Config> => {
  try {
    const file = await readFile(join(homedir(), '.smartmirror', 'config.yml'), 'utf-8');
    const content = load(file) as Config;
    return content;
  } catch(e) {
    console.error(e);
    exit();
  }
}