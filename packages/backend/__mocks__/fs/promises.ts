import { dirname, basename } from 'path';

type FileTree = Record<string, Record<string, string>>;

const fsPromises = jest.createMockFromModule<Record<string, unknown>>('fs/promises');

let mockFiles: FileTree = {};

const __setMockFiles = (newMockFiles: Record<string, string>): void =>  {
  mockFiles = {};
  Object.entries(newMockFiles).forEach(([filepath, value]) => {
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

fsPromises.__setMockFiles = __setMockFiles;
fsPromises.readdir = readdir;
fsPromises.readFile = readFile;

module.exports = fsPromises;