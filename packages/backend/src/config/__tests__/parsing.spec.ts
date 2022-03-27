import { PluginDefinition, WidgetConfig } from '@smartmirror.one/types';

import {  ManifestContent } from '../../types';
import {
  checkManifestRequirements,
  collectPluginFiles,
  dedupeWidgets,
  parseConfig,
  standardizeWidget,
  widgetFilter,
} from '../parsing';

jest.mock('fs/promises');
jest.mock('process');

describe('standardizeWidget', () => {
  const testWidget: Omit<WidgetConfig, 'id'> = {
    widget: 'widget',
    position: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    },
    inputs: {},
  };

  it('adds an id if none exists', () => {
    const input: Omit<WidgetConfig, 'id'> = {...testWidget};
    const output = standardizeWidget(input as WidgetConfig);
    expect(output.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
  });

  it('leaves existing ids alone', () => {
    const input: WidgetConfig = {
      id: 'foo',
      ...testWidget,
    };
    const output = standardizeWidget(input);
    expect(input.id).toEqual(output.id);
  });

  it('parses existing refreshRate', () => {
    const output = standardizeWidget({
      id: 'foo',
      refreshRate: '1m',
      ...testWidget,
    });
    expect(output.refreshRate).toEqual(60000);
  });
});

describe('dedupeWidgets', () => {
  it('converts multiple widget definitions into a list of used plugins', () => {
    const input: Partial<WidgetConfig>[] = [{
      widget: 'foo.bar',
    }, {
      widget: 'foo.baz',
    }, {
      widget: 'alpha.one',
    }, {
      widget: 'alpha.two',
    }, {
      widget: 'beta.one'
    }];
    const expected = [ 'foo', 'alpha', 'beta' ];
    const results = (input as WidgetConfig[]).reduce(dedupeWidgets, []);
    expect(results).toEqual(expect.arrayContaining(expected));
  });
});

describe('widgetFilter', () => {
  const exampleWidget: WidgetConfig = {
    id: 'example-widget',
    widget: 'foo.bar',
    position: {
      top: 0,
      left: 0,
      width: 1,
      height: 1,
    },
    inputs: {
      exampleInput: 'Hello!',
    },
  };

  const examplePlugin: PluginDefinition = {
    name: 'foo',
    author: '',
    email: '',
    widgets: {
      bar: {
        html: [],
        css: [],
        frontend: {},
        backend: {},
        variables: [{
          name: 'exampleInput',
          type: 'string',
        }],
      },
    },
  };

  it('drops widget definitions with incorrect variable inputs', () => {
    const malformedWidget = {
      ...exampleWidget,
      inputs: {
        fooInput: 'Nope!',
      },
    };
    const result = [malformedWidget].filter(item => widgetFilter({
      item,
      plugins: [examplePlugin],
    }));
    expect(result).toEqual([]);
  });
  
  it('drops widget definitions that reference unknown plugins', () => {
    const malformedWidget = {
      ...exampleWidget,
      widget: 'bar.foo',
    };
    const result = [malformedWidget].filter(item => widgetFilter({
      item,
      plugins: [examplePlugin],
    }));
    expect(result).toEqual([]);
  });
  
  it('leaves correct widget definitions alone', () => {
    const result = [exampleWidget].filter(item => widgetFilter({
      item,
      plugins: [examplePlugin],
    }));
    expect(result).toEqual(expect.arrayContaining([exampleWidget]));
  });
});

describe('collectPluginFiles', () => {
  const manifest = {
    name: 'plugin',
    author: 'A Plugin Author',
    email: 'plugins@smartmirror.one',
    widgets: {
      foo: {
        html: ['index.html'],
        css: ['style.css'],
        variables: [],
        refreshRate: '5m',
      }
    }
  };

  const mockFiles = {
    'test/plugin/manifest.json': JSON.stringify(manifest),
    'test/plugin/foo/backend.js': '/* JS */',
    'test/plugin/foo/frontend/index.html': '/* HTML */',
    'test/plugin/foo/frontend/style.css': '/* CSS */',
    'test/plugin/foo/frontend/events/start.js': '/* JS */',
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);

    jest.doMock('test/plugin/foo/backend.js', () => {
      return { beforeLoad(){} };
    }, { virtual: true });
  });

  it('collects all files referenced in the plugin manifest', async () => {
    const result = await collectPluginFiles({
      rootFolder: 'test',
      pluginReferences: ['plugin'],
    });

    const expected: PluginDefinition = {
      ...manifest,
      widgets: {
        foo: {
          html: ['/* HTML */'],
          css: ['/* CSS */'],
          backend: {
            beforeLoad: expect.any(Function),
          },
          frontend: {
            start: '/* JS */',
          },
          variables: [],
        },
      },
    };

    expect(result[0]).toMatchObject(expected);
  });

  it('throws an error when a file cannot be found', async () => {
    expect(async () => {
      await collectPluginFiles({
        rootFolder: 'test',
        pluginReferences: ['noPlugin'],
      });
    }).rejects.toThrow('No such file');
  });

  it('parsed refreshRate to a number', async () => {
    const result = await collectPluginFiles({
      rootFolder: 'test',
      pluginReferences: ['plugin'],
    });
    expect(result[0].widgets['foo'].refreshRate).toEqual(300000);
  });
});

describe('checkManifestRequirements', () => {
  const manifest: ManifestContent = {
    name: 'plugin',
    author: 'A Plugin Author',
    email: 'plugins@smartmirror.one',
    widgets: {
      foo: {
        html: ['index.html'],
        css: ['style.css'],
        variables: []
      }
    }
  };

  it('throws an error when one of the required keys is not found', async () => {
    for (const key of [ 'name', 'author', 'email' ]) {
      const manifestCopy: Partial<ManifestContent> = {...manifest};
      // @ts-ignore:next-line
      delete manifestCopy[key];
      expect(() => checkManifestRequirements({
        manifest: manifestCopy as ManifestContent,
        plugin: 'plugin',
      })).toThrow(key);
    }
  });
});

describe('parseConfig', () => {
  const mockFiles = {
    'config.yml': '\n',
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);
  });

  it('provides a fallback config', async () => {
    const result = await parseConfig('config.yml');
    const expected = {
      boardSetup: {
        height: 10,
        testMode: false,
        width: 10,
      },
      port: 3000,
      widgets: [{
        id: expect.any(String),
        widget: 'plugin-greeting.default',
        position: {
          width: 10,
          height: 2,
          top: 5,
          left: 5,
        },
        inputs: {
          displayName: 'there',
        },
      }],
    };
    expect(result).toEqual(expected);
  });
});