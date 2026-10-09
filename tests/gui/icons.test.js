import {describe, test, expect} from 'vitest';

import {
  getIconElement,
  getButton,
  setButtonPressed,
  isButtonPressed,
  toggleButtonPressed
} from '../../src/gui/icons.js';

describe('getIconElement', () => {
  test('returns an svg with a path', () => {
    const svg = getIconElement('Scroll');
    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 -960 960 960');
    const path = svg.querySelector('path');
    expect(path).not.toBeNull();
    expect(path.getAttribute('d')).toBeTruthy();
  });

  test('is case insensitive', () => {
    expect(getIconElement('zoomandpan').innerHTML)
      .toBe(getIconElement('ZoomAndPan').innerHTML);
  });

  test('throws on unknown name', () => {
    expect(() => getIconElement('unknown')).toThrow('No icon with name');
  });
});

describe('button state', () => {
  test('getButton sets name and title', () => {
    const button = getButton('Lock');
    expect(button.name).toBe('Lock');
    expect(button.title).toBe('Lock');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  test('setButtonPressed swaps value and icon', () => {
    const button = getButton('Lock');
    const offIcon = getIconElement('lock_off').innerHTML;

    setButtonPressed(button, true);
    expect(isButtonPressed(button)).toBe(true);
    expect(button.firstChild.innerHTML).toBe(offIcon);

    setButtonPressed(button, false);
    expect(isButtonPressed(button)).toBe(false);
    expect(button.firstChild.innerHTML).not.toBe(offIcon);
  });

  test('toggleButtonPressed flips the state', () => {
    const button = getButton('View');
    expect(isButtonPressed(button)).toBe(false);
    toggleButtonPressed(button);
    expect(isButtonPressed(button)).toBe(true);
    toggleButtonPressed(button);
    expect(isButtonPressed(button)).toBe(false);
  });
});
