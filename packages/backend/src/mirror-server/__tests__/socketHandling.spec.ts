import * as sendToFrontend from '../sendToFrontend';
import { handleMessage } from '../socketHandling';
import { Config, GlobalTest } from '../../types';

describe.only('handleMessage', () => {
  const testFn = jest.fn();
  const send = jest.fn();
  const exampleConfig: Config = (globalThis as unknown as GlobalTest)
    .getConfig({ backend: { testFn }});
  const spy = jest.spyOn(sendToFrontend, 'sendToFrontend');

  it('handles requestSetup', () => {
    handleMessage({
      config: exampleConfig,
      msg: JSON.stringify({
        action: 'requestSetup',
        payload: {},
      }),
      // @ts-ignore next-line
      socket: { send },
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('handles requestMethod', () => {
    handleMessage({
      config: exampleConfig,
      msg: JSON.stringify({
        action: 'requestMethod',
        payload: {
          id: 'example-widget',
          method: 'testFn',
        },
      }),
      // @ts-ignore next-line
      socket: { send },
    });
    expect(testFn).toHaveBeenCalledTimes(1);
  });
});