import {AnnotationComponent} from './annotationComponent.js';
import {getIconElement} from './icons.js';

/**
 * @import {DwvAppService} from './dwvAppService.js';
 * @import {AnnotationService} from './annotationService.js';
 */

// panel widths, see doc/design/rightPanel.md
/**
 * Initial panel width in pixels.
 *
 * @type {number}
 */
export const PANEL_INITIAL_WIDTH = 300;
/**
 * Minimum panel width in pixels.
 *
 * @type {number}
 */
export const PANEL_MIN_WIDTH = 200;
/**
 * Maximum panel width as a ratio of the window width.
 *
 * @type {number}
 */
export const PANEL_MAX_WIDTH_RATIO = 0.5;
/**
 * Keyboard resize step in pixels.
 *
 * @type {number}
 */
export const PANEL_KEY_STEP = 20;

/**
 * Get the maximum panel width: 60% of the window width, rounded,
 * and never below the minimum width.
 *
 * @param {number} windowWidth The window width in pixels.
 * @returns {number} The maximum width in pixels.
 */
export function getMaxPanelWidth(windowWidth) {
  return Math.max(
    PANEL_MIN_WIDTH, Math.round(windowWidth * PANEL_MAX_WIDTH_RATIO));
}

/**
 * Round and clamp a panel width to the width limits.
 *
 * @param {number} width The input width in pixels.
 * @param {number} windowWidth The window width in pixels.
 * @returns {number} The clamped width in pixels.
 */
export function clampPanelWidth(width, windowWidth) {
  return Math.min(
    getMaxPanelWidth(windowWidth),
    Math.max(PANEL_MIN_WIDTH, Math.round(width)));
}

/**
 * Get the panel width resulting from a resize key press.
 *
 * @param {string} key The keyboard event key.
 * @param {number} width The current width in pixels.
 * @param {number} windowWidth The window width in pixels.
 * @returns {number|undefined} The new width in pixels (clamped),
 *   undefined if the key is not a resize key.
 */
export function getKeyResizeWidth(key, width, windowWidth) {
  let newWidth;
  if (key === 'ArrowLeft') {
    newWidth = width + PANEL_KEY_STEP;
  } else if (key === 'ArrowRight') {
    newWidth = width - PANEL_KEY_STEP;
  } else if (key === 'Home') {
    newWidth = PANEL_MIN_WIDTH;
  } else if (key === 'End') {
    newWidth = getMaxPanelWidth(windowWidth);
  }
  if (typeof newWidth === 'undefined') {
    return undefined;
  }
  return clampPanelWidth(newWidth, windowWidth);
}

/**
 * Get the right panel element id.
 *
 * @param {string} viewerId The viewer id.
 * @returns {string} The id.
 */
export function getRightPanelDivId(viewerId) {
  return viewerId + '-right-panel';
}

/**
 * Get the right panel body element id, the parent of the panel content.
 *
 * @param {string} viewerId The viewer id.
 * @returns {string} The id.
 */
export function getRightPanelBodyDivId(viewerId) {
  return viewerId + '-right-panel-content';
}

/**
 * Get a right panel toggle button.
 *
 * @param {string} viewerId The viewer id.
 * @param {boolean} isOpenToggle True for the toggle shown when the panel
 *   is open (it closes it).
 * @returns {HTMLButtonElement} The button.
 */
function getToggleButton(viewerId, isOpenToggle) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'right-panel-toggle';
  button.part = 'right-panel-toggle';
  button.title = isOpenToggle ? 'Close panel' : 'Open panel';
  button.setAttribute('aria-expanded', String(isOpenToggle));
  button.setAttribute('aria-controls', getRightPanelDivId(viewerId));
  button.appendChild(
    getIconElement(isOpenToggle ? 'chevronright' : 'chevronleft'));
  return button;
}

/**
 * Get the right panel HTML elements, in closed state.
 *
 * @param {string} viewerId The viewer id.
 * @returns {HTMLElement[]} The toggle strip and the panel elements.
 */
export function getRightPanelElements(viewerId) {
  // toggle strip (closed only)
  const toggleStrip = document.createElement('div');
  toggleStrip.id = viewerId + '-right-panel-toggle-strip';
  toggleStrip.className = 'right-panel-toggle-strip';
  toggleStrip.part = 'right-panel-toggle-strip';
  toggleStrip.appendChild(getToggleButton(viewerId, false));

  // panel
  const panel = document.createElement('aside');
  panel.id = getRightPanelDivId(viewerId);
  panel.className = 'right-panel';
  panel.part = 'right-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');

  // resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'right-panel-resize-handle';
  resizeHandle.part = 'right-panel-resize-handle';
  resizeHandle.tabIndex = 0;
  resizeHandle.title = 'Resize panel';
  resizeHandle.setAttribute('role', 'separator');
  resizeHandle.setAttribute('aria-orientation', 'vertical');
  resizeHandle.setAttribute('aria-controls', panel.id);
  resizeHandle.setAttribute('aria-label', 'Resize panel');

  // header
  const header = document.createElement('div');
  header.className = 'right-panel-header';
  header.part = 'right-panel-header';
  header.appendChild(getToggleButton(viewerId, true));

  // body
  const body = document.createElement('div');
  body.id = getRightPanelBodyDivId(viewerId);
  body.className = 'right-panel-body';
  body.part = 'right-panel-body';

  // content, fixed to the panel width
  const content = document.createElement('div');
  content.className = 'right-panel-content';
  content.part = 'right-panel-content';
  content.appendChild(header);
  content.appendChild(body);

  panel.appendChild(resizeHandle);
  panel.appendChild(content);

  return [toggleStrip, panel];
}

/**
 * Right panel class: foldable and resizable side panel
 * (see doc/design/rightPanel.md).
 */
export class RightPanel {

  /**
   * The dwv app service.
   *
   * @type {DwvAppService}
   */
  #dwvAppService;

  /**
   * The viewer id.
   *
   * @type {string}
   */
  #viewerId;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc;

  /**
   * Annotation component.
   *
   * @type {AnnotationComponent}
   */
  #annotComponent;

  /**
   * Open state.
   *
   * @type {boolean}
   */
  #isOpen = false;

  /**
   * Panel width when open, in pixels.
   *
   * @type {number}
   */
  #width = PANEL_INITIAL_WIDTH;

  /**
   * Pointer drag resize in progress.
   *
   * @type {boolean}
   */
  #isResizing = false;

  /**
   * Pointer x at resize start.
   *
   * @type {number}
   */
  #startX = 0;

  /**
   * Width at resize start.
   *
   * @type {number}
   */
  #startWidth = 0;

  /**
   * @param {DwvAppService} dwvAppService The dwv app service.
   * @param {AnnotationService} annotService The annotation service.
   */
  constructor(dwvAppService, annotService) {
    this.#dwvAppService = dwvAppService;
    this.#viewerId = dwvAppService.getOptions().viewerId;
    this.#rootDoc = dwvAppService.getOptions().rootDocument;

    this.#annotComponent = new AnnotationComponent(
      annotService, this.#rootDoc, this.#viewerId);
  }

  /**
   * Initialise the GUI.
   */
  init() {
    this.#setupUI();
    this.#render();

    this.#annotComponent.registerListeners();
  }

  /**
   * Is the panel open.
   *
   * @returns {boolean} True if open.
   */
  isOpen() {
    return this.#isOpen;
  }

  /**
   * Get the panel width when open.
   *
   * @returns {number} The width in pixels.
   */
  getWidth() {
    return this.#width;
  }

  /**
   * Open or close the panel and move the focus to the visible toggle.
   *
   * @param {boolean} open True to open.
   */
  setOpen(open) {
    if (open === this.#isOpen) {
      return;
    }
    this.#isOpen = open;
    this.#render();
    // refit the view to its new size
    this.#dwvAppService.onResize();
    const toggle = open
      ? this.#getPanel()?.querySelector('.right-panel-toggle')
      : this.#getToggleStrip()?.querySelector('.right-panel-toggle');
    toggle?.focus();
  }

  /**
   * Set the panel width, rounded and clamped to the width limits.
   *
   * @param {number} width The width in pixels.
   */
  setWidth(width) {
    const newWidth = clampPanelWidth(width, window.innerWidth);
    if (newWidth === this.#width) {
      return;
    }
    this.#width = newWidth;
    this.#render();
    // refit the view to its new size
    if (this.#isOpen) {
      this.#dwvAppService.onResize();
    }
  }

  /**
   * Get the panel element.
   *
   * @returns {HTMLElement|null} The element.
   */
  #getPanel() {
    return this.#rootDoc.getElementById(getRightPanelDivId(this.#viewerId));
  }

  /**
   * Get the toggle strip element.
   *
   * @returns {HTMLElement|null} The element.
   */
  #getToggleStrip() {
    return this.#rootDoc.getElementById(
      this.#viewerId + '-right-panel-toggle-strip');
  }

  /**
   * Get the resize handle element.
   *
   * @returns {HTMLElement|null} The element.
   */
  #getResizeHandle() {
    return this.#getPanel()?.querySelector('.right-panel-resize-handle');
  }

  /**
   * Render the panel state.
   */
  #render() {
    const panel = this.#getPanel();
    const toggleStrip = this.#getToggleStrip();
    if (!panel || !toggleStrip) {
      return;
    }
    const open = this.#isOpen;

    toggleStrip.hidden = open;

    panel.classList.toggle('open', open);
    panel.classList.toggle('resizing', this.#isResizing);
    panel.style.width = open ? this.#width + 'px' : '0';
    if (open) {
      panel.removeAttribute('aria-hidden');
    } else {
      panel.setAttribute('aria-hidden', 'true');
    }
    panel.toggleAttribute('inert', !open);

    const content = panel.querySelector('.right-panel-content');
    if (content) {
      content.style.width = this.#width + 'px';
    }

    const handle = this.#getResizeHandle();
    if (handle) {
      handle.setAttribute('aria-valuenow', String(this.#width));
      handle.setAttribute('aria-valuemin', String(PANEL_MIN_WIDTH));
      handle.setAttribute('aria-valuemax',
        String(getMaxPanelWidth(window.innerWidth)));
    }
  }

  /**
   * Setup the UI: bind the toggle and resize actions.
   */
  #setupUI() {
    const panel = this.#getPanel();
    const toggleStrip = this.#getToggleStrip();
    const handle = this.#getResizeHandle();
    if (!panel || !toggleStrip || !handle) {
      return;
    }

    // toggles
    toggleStrip.querySelector('.right-panel-toggle')
      ?.addEventListener('click', () => {
        this.setOpen(true);
      });
    panel.querySelector('.right-panel-header .right-panel-toggle')
      ?.addEventListener('click', () => {
        this.setOpen(false);
      });

    // pointer resize
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      handle.setPointerCapture?.(event.pointerId);
      this.#isResizing = true;
      this.#startX = event.clientX;
      this.#startWidth = this.#width;
      this.#render();
    });
    handle.addEventListener('pointermove', (event) => {
      if (!this.#isResizing) {
        return;
      }
      // moving left widens the panel
      this.setWidth(this.#startWidth - (event.clientX - this.#startX));
    });
    const onResizeEnd = (event) => {
      if (!this.#isResizing) {
        return;
      }
      if (handle.hasPointerCapture?.(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
      this.#isResizing = false;
      this.#render();
    };
    handle.addEventListener('pointerup', onResizeEnd);
    handle.addEventListener('pointercancel', onResizeEnd);

    // keyboard resize
    handle.addEventListener('keydown', (event) => {
      const width = getKeyResizeWidth(
        event.key, this.#width, window.innerWidth);
      if (typeof width === 'undefined') {
        return;
      }
      event.preventDefault();
      this.setWidth(width);
    });
  }
};
