import {AnnotationUI} from './annotationUI.js';

/**
 * Righ panel class.
 */
export class RightPanel {

  /**
   * The associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * The GUI UID.
   *
   * @type {string}
   */
  #uid;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * Annotation UI.
   *
   * @type {AnnotationUI}
   */
  #annotationUI;

  /**
   * @param {App} app The associated app.
   * @param {string} uid The GUI unique id.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(app, uid, rootDoc) {
    this.#app = app;
    this.#uid = uid;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }

    this.#annotationUI = new AnnotationUI(app, uid, rootDoc);
  }

  /**
   * Get the right panel content div id.
   *
   * @returns {string} The id.
   */
  #getRightPanelContentDivId() {
    return 'right-panel-content-' + this.#uid;
  }

  /**
   * Initialise the GUI.
   */
  init() {
    this.#setupUI();

    this.#annotationUI.registerListeners();
  }

  /**
   * Setup the UI: bind app and panel actions.
   */
  #setupUI() {
    const toggleButton = this.#rootDoc.getElementById(
      'togglebtn-' + this.#uid
    );
    const rightPanel = this.#rootDoc.getElementById(
      'right-panel-' + this.#uid
    );
    const content = this.#rootDoc.getElementById(
      this.#getRightPanelContentDivId()
    );
    const resizer = this.#rootDoc.getElementById(
      'resizer-' + this.#uid
    );

    // sizes (have to be in sync with css)
    const panelCollapsedWidth = 25;
    const panelPadding = 10;

    const minPanelWidth = 200;
    const maxPanelWidth = 600;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    // collapse/expand button
    toggleButton.addEventListener('click', () => {
      if (rightPanel.clientWidth > panelCollapsedWidth + panelPadding) {
        // collapse
        rightPanel.style.width = panelCollapsedWidth + 'px';
        content.style.display = 'none';
        resizer.style.display = 'none';
      } else {
        // expand
        rightPanel.style.width = '30%';
        content.style.display = 'block';
        resizer.style.display = 'block';
      }
      this.#app.onResize();
    });

    // activate resizing
    const onResizeStart = function (event) {
      isResizing = true;
      startX = event.clientX;
      startWidth = rightPanel.offsetWidth;
      // activate related listeners
      document.addEventListener('mousemove', onResizing);
      document.addEventListener('mouseup', onResizeStop);
    };
    // do resizing
    const onResizing = (event) => {
      if (!isResizing) {
        return;
      }
      const newWidth = startWidth - (event.clientX - startX);
      if (newWidth > minPanelWidth && newWidth < maxPanelWidth) {
        rightPanel.style.width = newWidth + 'px';
        this.#app.onResize();
      }
    };
    // stop resizing
    const onResizeStop = function () {
      isResizing = false;
      // stop related listeners
      document.removeEventListener('mousemove', onResizing);
      document.removeEventListener('mouseup', onResizeStop);
    };
    resizer.addEventListener('mousedown', onResizeStart);
  }
};