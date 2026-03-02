import {Toolbar} from './gui/toolbar.js';
import {RightPanel} from './gui/rightPanel.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DwvService} from './dwv.service.js';
/* eslint-enable no-unused-vars */

/**
 * Get the dwv div id.
 *
 * @param {string} uid The app unique id.
 * @returns {string} The id.
 */
export function getDwvDivId(uid) {
  return 'dwv-' + uid;
};

/**
 * Get the layer group div id.
 *
 * @param {string} uid The app unique id.
 * @returns {string} The id.
 */
export function getLayerGroupDivId(uid) {
  return 'layerGroup-' + uid;
};

/**
 * Get the header div id.
 *
 * @param {string} uid The app unique id.
 * @returns {string} The id.
 */
export function getHeaderDivId(uid) {
  return 'header-' + uid;
};

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
  #rootDoc;

  /**
   * The toolbar.
   *
   * @type {Toolbar}
   */
  #toolbar;

  /**
   * The right panel.
   *
   * @type {RightPanel}
   */
  #rightPanel;

  /**
   * @param {DwvService} dwvService The dwv service.
   * @param {string[]} optionGuiTools The list of gui tools.
   */
  constructor(dwvService, optionGuiTools) {
    this.#uid = dwvService.getOptions().uid;
    this.#rootDoc = dwvService.getOptions().rootDocument;

    this.#toolbar = new Toolbar(dwvService, optionGuiTools);
    this.#rightPanel = new RightPanel(dwvService);

    dwvService.addEventListener('loadprogress', (event) => {
      this.setProgress(event.detail.value);
    });
  };

  /**
   * Initialise the GUI.
   */
  init() {
    this.#toolbar.init();
    this.#rightPanel.init();
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
  #getProgressDivId() {
    return 'progress-' + this.#uid;
  };

  /**
   * Set the progress: add if not present, update value,
   *   hide if percent is 100.
   *
   * @param {number} percent The progess percent.
   */
  setProgress(percent) {
    let progressDiv = this.#rootDoc.getElementById(
      this.#getProgressDivId());
    // create if not present
    if (!progressDiv) {
      progressDiv = document.createElement('progress');
      progressDiv.id = this.#getProgressDivId();
      progressDiv.max = '100';
      progressDiv.value = '0';
      // add as first header child
      const header = this.#rootDoc.getElementById(
        getHeaderDivId(this.#uid));
      header.insertBefore(progressDiv, header.firstChild);
    }
    // remove or update value
    if (percent === 100) {
      progressDiv.remove();
    } else {
      progressDiv.value = percent;
    }
  };

}; // class Gui
