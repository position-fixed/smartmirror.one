import { executePluginMethod } from '../executePluginMethod';
import { Config, GlobalTest } from '../../types';

describe('executePluginMethod', () => {
  const exampleFunction = jest.fn();
  const exampleConfig: Config = (globalThis as unknown as GlobalTest)
    .getConfig({ backend: { exampleFunction } });

  it('executes a requested method', () => {
    executePluginMethod({
      config: exampleConfig,
      methodName: 'exampleFunction',
      widgetId: 'example-widget',
    });
    expect(exampleFunction).toBeCalledTimes(1);
  });

  it('returns null when the requested widget cannot be found', () => {
    const result = executePluginMethod({
      config: exampleConfig,
      methodName: 'exampleFunction',
      widgetId: 'example-foo',
    });
    expect(result).toBe(null);
  });

  it('returns null when the requested method cannot be found', () => {
    const result = executePluginMethod({
      config: exampleConfig,
      methodName: 'wrongFunction',
      widgetId: 'example-widget',
    });
    expect(result).toBe(null);
  });
});