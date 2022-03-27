import type { Server2Client } from '@smartmirror.one/types';
import { WebSocket } from 'ws';

interface SendToFrontendProps {
  action: keyof typeof Server2Client,
  payload: Record<string, unknown>,
  socket: WebSocket,
}

export const sendToFrontend = ({
  action,
  payload,
  socket,
}: SendToFrontendProps): void => {
  socket.send(
    JSON.stringify({ action, payload }),
  );
};