import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';

import {
  PANEL_INITIAL_WIDTH,
  PANEL_MIN_WIDTH,
  getMaxPanelWidth,
  clampPanelWidth,
  getKeyResizeWidth,
  getRightPanelElements,
  getRightPanelDivId,
  getRightPanelBodyDivId,
  RightPanel
} from '../../src/lib/rightPanel.js';

describe('width limits', () => {
  test('max is 60% of the window, rounded, never below min', () => {
    expect(getMaxPanelWidth(1000)).toBe(600);
    expect(getMaxPanelWidth(1001)).toBe(601);
    expect(getMaxPanelWidth(100)).toBe(PANEL_MIN_WIDTH);
  });

  test('clamp rounds and clamps', () => {
    expect(clampPanelWidth(250.4, 1000)).toBe(250);
    expect(clampPanelWidth(10, 1000)).toBe(PANEL_MIN_WIDTH);
    expect(clampPanelWidth(900, 1000)).toBe(600);
    expect(clampPanelWidth(300, 100)).toBe(PANEL_MIN_WIDTH);
  });

  test('key resize', () => {
    expect(getKeyResizeWidth('ArrowLeft', 300, 1000)).toBe(320);
    expect(getKeyResizeWidth('ArrowRight', 300, 1000)).toBe(280);
    expect(getKeyResizeWidth('ArrowRight', 210, 1000)).toBe(PANEL_MIN_WIDTH);
    expect(getKeyResizeWidth('ArrowLeft', 590, 1000)).toBe(600);
    expect(getKeyResizeWidth('Home', 300, 1000)).toBe(PANEL_MIN_WIDTH);
    expect(getKeyResizeWidth('End', 300, 1000)).toBe(600);
    expect(getKeyResizeWidth('Enter', 300, 1000)).toBeUndefined();
  });
});

describe('getRightPanelElements', () => {
  test('builds a closed panel structure', () => {
    const [strip, panel] = getRightPanelElements('u0');
    expect(panel.tagName).toBe('ASIDE');
    expect(panel.id).toBe(getRightPanelDivId('u0'));
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(true);

    const stripToggle = strip.querySelector('.right-panel-toggle');
    expect(stripToggle.title).toBe('Open panel');
    expect(stripToggle.getAttribute('aria-expanded')).toBe('false');
    expect(stripToggle.getAttribute('aria-controls')).toBe(panel.id);

    const handle = panel.querySelector('.right-panel-resize-handle');
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-controls')).toBe(panel.id);
    expect(handle.getAttribute('aria-label')).toBe('Resize panel');
    expect(handle.tabIndex).toBe(0);

    const headerToggle =
      panel.querySelector('.right-panel-header .right-panel-toggle');
    expect(headerToggle.title).toBe('Close panel');
    expect(headerToggle.getAttribute('aria-expanded')).toBe('true');

    const body = panel.querySelector('.right-panel-body');
    expect(body.id).toBe(getRightPanelBodyDivId('u0'));
  });
});

describe('RightPanel', () => {
  let container;
  let rightPanel;
  let onResize;

  beforeEach(() => {
    container = document.createElement('div');
    container.append(...getRightPanelElements('rp'));
    document.body.appendChild(container);
    onResize = vi.fn();
    const dwvAppService = {
      getOptions: () => ({uid: 'rp', rootDocument: document}),
      onResize: onResize
    };
    const annotService = {
      getSnapshot: () => ({groups: []}),
      subscribe: () => () => {}
    };
    rightPanel = new RightPanel(dwvAppService, annotService);
    rightPanel.init();
  });

  afterEach(() => {
    container.remove();
  });

  const getPanel = () => document.getElementById('right-panel-rp');
  const getStrip = () =>
    document.getElementById('right-panel-toggle-strip-rp');
  const getHandle = () =>
    getPanel().querySelector('.right-panel-resize-handle');

  test('starts closed', () => {
    expect(rightPanel.isOpen()).toBe(false);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH);
    expect(getPanel().style.width).toBe('0px');
    expect(getStrip().hidden).toBe(false);
    expect(getHandle().getAttribute('aria-valuenow'))
      .toBe(String(PANEL_INITIAL_WIDTH));
    expect(getHandle().getAttribute('aria-valuemin'))
      .toBe(String(PANEL_MIN_WIDTH));
  });

  test('toggles open and closed, moving the focus', () => {
    getStrip().querySelector('.right-panel-toggle').click();
    expect(rightPanel.isOpen()).toBe(true);
    const panel = getPanel();
    expect(panel.style.width).toBe(PANEL_INITIAL_WIDTH + 'px');
    expect(panel.classList.contains('open')).toBe(true);
    expect(panel.hasAttribute('aria-hidden')).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(false);
    expect(getStrip().hidden).toBe(true);
    const headerToggle =
      panel.querySelector('.right-panel-header .right-panel-toggle');
    expect(document.activeElement).toBe(headerToggle);

    headerToggle.click();
    expect(rightPanel.isOpen()).toBe(false);
    expect(panel.style.width).toBe('0px');
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(document.activeElement)
      .toBe(getStrip().querySelector('.right-panel-toggle'));
  });

  test('keeps the width while closed', () => {
    rightPanel.setOpen(true);
    rightPanel.setWidth(250);
    rightPanel.setOpen(false);
    expect(rightPanel.getWidth()).toBe(250);
    expect(getPanel().querySelector('.right-panel-content').style.width)
      .toBe('250px');
    rightPanel.setOpen(true);
    expect(getPanel().style.width).toBe('250px');
  });

  test('resizes with the keyboard', () => {
    rightPanel.setOpen(true);
    const handle = getHandle();
    const event = new KeyboardEvent(
      'keydown', {key: 'ArrowLeft', cancelable: true});
    handle.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH + 20);
    expect(handle.getAttribute('aria-valuenow'))
      .toBe(String(PANEL_INITIAL_WIDTH + 20));

    handle.dispatchEvent(new KeyboardEvent('keydown', {key: 'Home'}));
    expect(rightPanel.getWidth()).toBe(PANEL_MIN_WIDTH);

    const other = new KeyboardEvent('keydown', {key: 'a', cancelable: true});
    handle.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
  });

  test('resizes with a primary button pointer drag', () => {
    rightPanel.setOpen(true);
    const handle = getHandle();
    // jsdom has no PointerEvent: use mouse events with the pointer types
    const pointer = (type, clientX, button = 0) => {
      handle.dispatchEvent(new MouseEvent(type, {clientX, button}));
    };
    // other buttons are ignored
    pointer('pointerdown', 500, 2);
    pointer('pointermove', 450);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH);

    pointer('pointerdown', 500);
    expect(getPanel().classList.contains('resizing')).toBe(true);
    pointer('pointermove', 450);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH + 50);
    pointer('pointermove', 530);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH - 30);
    pointer('pointerup', 530);
    expect(getPanel().classList.contains('resizing')).toBe(false);
    pointer('pointermove', 400);
    expect(rightPanel.getWidth()).toBe(PANEL_INITIAL_WIDTH - 30);
  });

  test('refits the view on open, close and width change', () => {
    rightPanel.setWidth(250);
    // closed: no view size change
    expect(onResize).not.toHaveBeenCalled();
    rightPanel.setOpen(true);
    expect(onResize).toHaveBeenCalledTimes(1);
    rightPanel.setWidth(280);
    expect(onResize).toHaveBeenCalledTimes(2);
    // same width: no refit
    rightPanel.setWidth(280);
    expect(onResize).toHaveBeenCalledTimes(2);
    rightPanel.setOpen(false);
    expect(onResize).toHaveBeenCalledTimes(3);
  });
});
