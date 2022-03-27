import { WebSocket } from 'ws';
import type {
  Client2Server,
  MirrorSetup,
} from '@smartmirror.one/types';

import { Config } from '../types';
import { executePluginMethod } from './executePluginMethod';
import { sendToFrontend } from './sendToFrontend';

type ClientMessage = {
  action: keyof typeof Client2Server,
  payload: Record<string, unknown>,
};

interface HandleMessageProps {
  config: Config;
  msg: string;
  socket: WebSocket;
}

interface ConnectHandlersProps {
  config: Config;
  socket: WebSocket;
}

export const handleMessage = ({
  config,
  msg,
  socket,
}: HandleMessageProps): void => {
  const { action, payload } = JSON.parse(msg) as ClientMessage;
  switch (action) {

  case 'requestSetup':
    const setup: MirrorSetup = {
      boardSetup: config.boardSetup,
      plugins: config.plugins,
      widgets: config.widgets,
    };
    sendToFrontend({
      action: 'setup',
      payload: setup,
      socket,
    });
    break;

  case 'requestMethod':
    const widgetId = payload.id as string;
    const update = executePluginMethod({
      config,
      data: payload.data as Record<string, unknown> || {},
      methodName: payload.method as string,
      widgetId,
    });

    sendToFrontend({
      action: 'widgetUpdate',
      payload: { id: widgetId, update },
      socket,
    });
    break;
  }
};

export const connectHandlers = ({ config, socket }: ConnectHandlersProps): void => {
  socket.on('message', (msg) => handleMessage({
    config,
    msg: msg.toString(),
    socket,
  }));
};