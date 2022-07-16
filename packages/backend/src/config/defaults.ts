import { randomUUID } from 'crypto';
import { WidgetConfig } from '@smartmirror.one/types';

export const DEFAULT_PLUGIN = 'plugin-greeting';

export const defaultWidget: Omit<WidgetConfig, 'data'> = {
  id: randomUUID(),
  inputs: {
    displayName: 'there',
  },
  plugin: DEFAULT_PLUGIN,
  position: {
    height: 2,
    left: 5,
    top: 5,
    width: 10,
  },
  widget: 'default',
};