import {describe, test, expect, vi} from 'vitest';
import {DwvService} from '../src/dwv.service.js';

describe('DwvService', () => {
  test('dispose removes the window listeners', () => {
    const div = document.createElement('div');
    div.id = 'layerGroup-dispose';
    document.body.appendChild(div);
    // only scroll: jsdom has no canvas (needed by the draw tool)
    const service = new DwvService({uid: 'dispose', tools: ['Scroll']});

    const spy = vi.spyOn(window, 'removeEventListener');
    service.dispose();
    const types = spy.mock.calls.map((call) => call[0]);
    expect(types).toContain('resize');
    expect(types).toContain('keydown');

    spy.mockRestore();
    div.remove();
  });
});
