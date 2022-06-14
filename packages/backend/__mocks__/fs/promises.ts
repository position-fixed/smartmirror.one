import { cwd } from 'process';
import { basename, dirname } from 'path';

type FileTree = Record<string, Record<string, string>>;

const fsPromises = jest.createMockFromModule<Record<string, unknown>>('fs/promises');

let mockFiles: FileTree = {};

const __setMockFiles = (newMockFiles: Record<string, string>): void =>  {
  mockFiles = {};
  addMockFiles(newMockFiles);
};

const __getMockFiles = (): FileTree => {
  return { ...mockFiles };
};

const addMockFiles = (newMockFiles: Record<string, string>): void => {
  Object.entries(newMockFiles).forEach(([ filepath, value ]) => {
    const dir = dirname(filepath);
    if (!mockFiles[dir]) {
      mockFiles[dir] = {};
    }
    mockFiles[dir][basename(filepath)] = value;
  });
};

type DirIntMock = {
  isFile: () => true;
  name: string;
}

const readdir = async (directoryPath: string): Promise<DirIntMock[]> => {
  if (!Object.prototype.hasOwnProperty.call(mockFiles, directoryPath)) {
    return [];
  }

  return Object.keys(mockFiles[directoryPath]).map(name => ({
    isFile: () => true,
    name,
  }));
};

const readFile = async (filePath: string): Promise<string | null> => {
  const dir = dirname(filePath);
  const file = basename(filePath);
  if (mockFiles[dir] && mockFiles[dir][file]) {
    return mockFiles[dir][file];
  }
  throw new Error('No such file');
};

const mkdir = async (directoryPath: string): Promise<string> => {
  const directory = dirname(directoryPath);

  if (!mockFiles[directory]) {
    mockFiles[directory] = {};
  }
  return directory;
};

const cp = async (sourcePath: string, destinationPath: string): Promise<void> => {
  const source = dirname(sourcePath.replace(cwd(), ''));
  const destination = dirname(destinationPath.replace(cwd(), ''));
  if (mockFiles[source]) {
    mockFiles[destination] = { ...mockFiles[source] };
    return;
  }
  throw new Error(`No such folder "${source}"`);
};

fsPromises.__setMockFiles = __setMockFiles;
fsPromises.__getMockFiles = __getMockFiles;
fsPromises.readdir = readdir;
fsPromises.readFile = readFile;
fsPromises.mkdir = mkdir;
fsPromises.cp = cp;

module.exports = fsPromises;