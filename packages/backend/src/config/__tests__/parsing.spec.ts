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
    inputs: {},
    position: {
      height: 0,
      left: 0,
      top: 0,
      width: 0,
    },
    widget: 'widget',
  };

  it('adds an id if none exists', () => {
    const input: Omit<WidgetConfig, 'id'> = { ...testWidget };
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
      widget: 'beta.one',
    }];
    const expected = [ 'foo', 'alpha', 'beta' ];
    const results = (input as WidgetConfig[]).reduce(dedupeWidgets, []);
    expect(results).toEqual(expect.arrayContaining(expected));
  });
});

describe('widgetFilter', () => {
  const exampleWidget: WidgetConfig = {
    id: 'example-widget',
    inputs: {
      exampleInput: 'Hello!',
    },
    position: {
      height: 1,
      left: 0,
      top: 0,
      width: 1,
    },
    widget: 'foo.bar',
  };

  const examplePlugin: PluginDefinition = {
    author: '',
    email: '',
    name: 'foo',
    widgets: {
      bar: {
        backend: {},
        css: [],
        frontend: {},
        html: [],
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
    const result = [ malformedWidget ].filter(item => widgetFilter({
      item,
      plugins: [ examplePlugin ],
    }));
    expect(result).toEqual([]);
  });

  it('drops widget definitions that reference unknown plugins', () => {
    const malformedWidget = {
      ...exampleWidget,
      widget: 'bar.foo',
    };
    const result = [ malformedWidget ].filter(item => widgetFilter({
      item,
      plugins: [ examplePlugin ],
    }));
    expect(result).toEqual([]);
  });

  it('leaves correct widget definitions alone', () => {
    const result = [ exampleWidget ].filter(item => widgetFilter({
      item,
      plugins: [ examplePlugin ],
    }));
    expect(result).toEqual(expect.arrayContaining([ exampleWidget ]));
  });
});

describe('collectPluginFiles', () => {
  const manifest = {
    author: 'A Plugin Author',
    email: 'plugins@smartmirror.one',
    name: 'plugin',
    widgets: {
      foo: {
        css: [ 'style.css' ],
        html: [ 'index.html' ],
        refreshRate: '5m',
        variables: [],
      },
    },
  };

  const mockFiles = {
    'test/plugin/foo/backend.js': '/* JS */',
    'test/plugin/foo/frontend/events/start.js': '/* JS */',
    'test/plugin/foo/frontend/index.html': '/* HTML */',
    'test/plugin/foo/frontend/style.css': '/* CSS */',
    'test/plugin/manifest.json': JSON.stringify(manifest),
  };

  beforeAll(() => {
    require('fs/promises').__setMockFiles(mockFiles);

    jest.doMock('test/plugin/foo/backend.js', () => {
      return { beforeLoad: jest.fn() };
    }, { virtual: true });
  });

  it('collects all files referenced in the plugin manifest', async () => {
    const result = await collectPluginFiles({
      rootFolder: 'test',
      pluginReferences: [ 'plugin' ],
    });

    const expected: PluginDefinition = {
      ...manifest,
      widgets: {
        foo: {
          backend: {
            beforeLoad: expect.any(Function),
          },
          css: [ '/* CSS */' ],
          frontend: {
            start: '/* JS */',
          },
          html: [ '/* HTML */' ],
          variables: [],
        },
      },
    };

    expect(result[0]).toMatchObject(expected);
  });

  it('throws an error when a file cannot be found', async () => {
    expect(async () => {
      await collectPluginFiles({
        pluginReferences: [ 'noPlugin' ],
        rootFolder: 'test',
      });
    }).rejects.toThrow('No such file');
  });

  it('parsed refreshRate to a number', async () => {
    const result = await collectPluginFiles({
      rootFolder: 'test',
      pluginReferences: [ 'plugin' ],
    });
    expect(result[0].widgets['foo'].refreshRate).toEqual(300000);
  });
});

describe('checkManifestRequirements', () => {
  const manifest: ManifestContent = {
    author: 'A Plugin Author',
    email: 'plugins@smartmirror.one',
    name: 'plugin',
    widgets: {
      foo: {
        css: [ 'style.css' ],
        html: [ 'index.html' ],
        variables: [],
      },
    },
  };

  it('throws an error when one of the required keys is not found', async () => {
    for (const key of [ 'name', 'author', 'email' ]) {
      const manifestCopy: Partial<ManifestContent> = { ...manifest };
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
        inputs: {
          displayName: 'there',
        },
        position: {
          height: 2,
          left: 5,
          top: 5,
          width: 10,
        },
        widget: 'plugin-greeting.default',
      }],
    };
    expect(result).toEqual(expected);
  });
});