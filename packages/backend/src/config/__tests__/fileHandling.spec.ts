import { DEFAULT_PLUGIN } from '../defaults';
import {
  getConfigFile,
  getFileContents,
  getJavascript,
  prepPluginEnvironment,
} from '../fileHandling';

jest.mock('fs/promises');

describe('getConfig', () => {
  const mockFiles = {
    '.config.yml': [
      'boardSetup:',
      '  height: 20',
      '  testMode: true',
      '  width: 20',
      'port: 3000',
    ].join('\n'),
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);
  });

  it('converts a .yml file to JSON', async () => {
    const config = await getConfigFile('.config.yml');
    const expected = {
      content: {
        boardSetup: {
          height: 20,
          testMode: true,
          width: 20,
        },
        port: 3000,
      },
      newEnvironment: false,
    };
    expect(config).toEqual(expected);
  });

  it('provides an empty fallback', async () => {
    const config = await getConfigFile('foo.yml');
    const expected = {
      content: {},
      newEnvironment: true,
    };
    expect (config).toEqual(expected);
  });
});

describe('getJavaScript', () => {
  const mockFiles = {
    'js/test.js': 'console.log();',
    'js/foo.js': 'console.log();',
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);
  });

  it('loads all javascript files in a folder into an object', async () => {
    const result = await getJavascript('js');
    const expected = {
      test: 'console.log();',
      foo: 'console.log();',
    };
    expect(result).toEqual(expected);
  });
});

describe('getFileContents', () => {
  const mockFiles = {
    'js/test.js': 'console.log();',
    'js/foo.js': 'console.log();',
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);
  });

  it('loads multiple files at once', async () => {
    const result = await getFileContents({
      rootFolder: 'js',
      filenames: [ 'test.js', 'foo.js' ],
    });
    const expected = [
      'console.log();',
      'console.log();',
    ];
    expect(result).toEqual(expected);
  });
});

describe('prepPluginEnvironment', () => {
  const mockFiles = {
    [`/_examples/${DEFAULT_PLUGIN}`]: {
      'test.js': 'console.log();',
      'foo.js': 'console.log();',
    },
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);
  });

  it('generates a default plugin', async () => {
    await prepPluginEnvironment('testFolder');
    const mockResult = require('fs/promises').__getMockFiles();
    expect(mockResult).toHaveProperty(`testFolder.${DEFAULT_PLUGIN}`);
  });
});