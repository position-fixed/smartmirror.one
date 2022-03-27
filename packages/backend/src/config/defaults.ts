
import { randomUUID } from 'crypto';
import { WidgetConfig } from '@smartmirror.one/types';

export const defaultWidget: WidgetConfig = {
  id: randomUUID(),
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
};