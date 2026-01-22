import {Toolbar} from './gui/toolbar.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from 'dwv';
/* eslint-enable no-unused-vars */

/**
 * GUI class.
 */
export class Gui {

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
   * The toolbar.
   *
   * @type {Toolbar}
   */
  #toolbar;

  /**
   * @param {App} app The associated app.
   * @param {object[]} appTools The list of app tools.
   * @param {string[]} guiTools The list of gui tools.
   * @param {string} uid The GUI unique id.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(app, appTools, guiTools, uid, rootDoc) {
    this.#uid = uid;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }

    this.#toolbar = new Toolbar(app, appTools, guiTools, uid, rootDoc);
  };

  /**
   * Initialise the GUI.
   */
  init() {
    this.#toolbar.init();
  };

  /**
   * Get the toolbar.
   *
   * @returns {Toolbar} The toolbar.
   */
  getToolbar() {
    return this.#toolbar;
  }

  /**
   * Get the dwv div id.
   *
   * @returns {string} The id.
   */
  #getProgressId() {
    return 'progress-' + this.#uid;
  };

  /**
   * Get the header div id.
   *
   * @returns {string} The id.
   */
  #getHeaderDivId() {
    return 'header-' + this.#uid;
  };

  /**
   * Show the progress bar: adds a progress to the
   *   layerGroup div.
   */
  showProgressBar() {
    const progress = document.createElement('progress');
    progress.id = this.#getProgressId();
    progress.max = '100';
    progress.value = '0';

    const lg = this.#rootDoc.getElementById(this.#getHeaderDivId());
    lg.appendChild(progress);
  };

  /**
   * Set the progress: updates the progress bar,
   *   hides it if percent is 100.
   *
   * @param {number} percent The progess percent.
   */
  setProgress(percent) {
    const progress = this.#rootDoc.getElementById(this.#getProgressId());
    if (progress) {
      if (percent === 100) {
        // remove
        progress.remove();
      } else {
        // update value
        progress.value = percent;
      }
    }
  };

}; // class Gui
