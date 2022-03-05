import { html, fixture, expect } from '@open-wc/testing';

import { SmartMirror } from '../src/components/smart-mirror';
import '../src/components/smart-mirror';

describe('SmartMirror', () => {
  it('can be mounted', async () => {
    const el: SmartMirror = await fixture(html` <smart-mirror></smart-mirror> `);

    expect(el.socket).to.not.equal(undefined);
  });
});