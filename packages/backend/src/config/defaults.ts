import { randomUUID } from 'crypto';
import { WidgetConfig } from '@smartmirror.one/types';

export const defaultWidget: Omit<WidgetConfig, 'data'> = {
  id: randomUUID(),
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
};