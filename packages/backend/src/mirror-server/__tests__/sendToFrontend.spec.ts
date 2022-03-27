import { sendToFrontend } from '../sendToFrontend';

describe('sendToFrontend', () => {
  const socketSend =  jest.fn();
  it('sends a stringified object through a socket', () => {
    sendToFrontend({
      action: 'connect',
      payload: { foo: 'bar' },
      // @ts-ignore next-line
      socket: { send: socketSend },
    });
    expect(socketSend).toBeCalledWith('{"action":"connect","payload":{"foo":"bar"}}');
  });
});