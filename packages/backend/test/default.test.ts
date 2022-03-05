import { WidgetConfig } from '@smartmirror.one/types';

import { standardizeWidget } from '../src/config';

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

describe('standardizeWidget', () => {
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