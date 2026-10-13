import {describe, test, expect} from 'vitest';
import {splitAttribute} from '../src/dwv-component.js';

/**
 * Create a test component: only uses the scroll tool since
 * jsdom has no canvas (needed by the draw tool).
 *
 * @param {string} id The component id.
 * @returns {HTMLElement} The component.
 */
function createComponent(id) {
  const element = document.createElement('dwv-simple');
  element.id = id;
  element.setAttribute('tools', 'scroll');
  return element;
}

/**
 * Wait for the pending microtasks.
 *
 * @returns {Promise} A promise resolved after the microtasks.
 */
function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('splitAttribute', () => {
  test('splits on white spaces', () => {
    expect(splitAttribute(' a\n  b\tc ')).toEqual(['a', 'b', 'c']);
  });

  test('keeps commas', () => {
    expect(splitAttribute('a,b c')).toEqual(['a,b', 'c']);
  });

  test('returns an empty list for blank values', () => {
    expect(splitAttribute('')).toEqual([]);
    expect(splitAttribute('  ')).toEqual([]);
  });
});

describe('DwvComponent', () => {
  test('is defined', () => {
    expect(customElements.get('dwv-simple')).toBeDefined();
  });

  test('renders in its shadow root when connected', () => {
    const element = createComponent('render');
    document.body.appendChild(element);
    const root = element.shadowRoot;
    expect(root.querySelector('style')).not.toBeNull();
    expect(root.getElementById('dwv-render')).not.toBeNull();
    expect(root.getElementById('layerGroup-render')).not.toBeNull();
    element.remove();
  });

  test('survives a move', async () => {
    const element = createComponent('move');
    document.body.appendChild(element);
    const container = element.shadowRoot.getElementById('dwv-move');

    const parent = document.createElement('div');
    document.body.appendChild(parent);
    expect(() => parent.appendChild(element)).not.toThrow();
    await flushMicrotasks();

    // same content, not rebuilt nor released
    expect(element.shadowRoot.getElementById('dwv-move')).toBe(container);
    parent.remove();
  });

  test('releases the viewer when removed', async () => {
    const element = createComponent('remove');
    document.body.appendChild(element);
    element.remove();
    await flushMicrotasks();
    expect(element.shadowRoot.childNodes.length).toBe(0);

    // rebuilt when connected again
    document.body.appendChild(element);
    expect(element.shadowRoot.getElementById('dwv-remove')).not.toBeNull();
    element.remove();
  });
});
