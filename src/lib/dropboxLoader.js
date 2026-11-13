/**
 * @import {DwvAppService} from './dwvAppService.js';
 */

/**
 * Get the drop box HTML element.
 *
 * @param {string} viewerId The viewer id.
 * @returns {HTMLElement} Drop box element.
 */
export function getDropboxElement(viewerId) {
  const dropBoxDiv = document.createElement('div');
  dropBoxDiv.id = viewerId + '-dropBox';
  return dropBoxDiv;
}

/**
 * Dropbox loader.
 * Listens to drag events on the layer container and
 *   uses a drop box element as first display.
 */
export class DropboxLoader {

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

  // drop box class name
  #dropboxClassName = 'dropBox';
  #borderClassName = 'dropBoxBorder';
  #hoverClassName = 'hover';

  /**
   * @param {DwvAppService} dwvAppService The dwv app service.
   */
  constructor(dwvAppService) {
    this.#dwvAppService = dwvAppService;
    this.#viewerId = dwvAppService.getOptions().viewerId;
    this.#rootDoc = dwvAppService.getOptions().rootDocument;
  }

  /**
   * Initialise the drop box.
   */
  init() {
    this.showDropbox(true);
  };

  /**
   * Get the drop box div id.
   *
   * @returns {string} The id.
   */
  #getDropboxDivId() {
    return this.#viewerId + '-dropBox';
  }

  /**
   * Basic handle drag event.
   *
   * @param {object} event The event to handle.
   */
  #defaultHandleDragEvent = (event) => {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Handle a drag over.
   *
   * @param {object} event The event to handle.
   */
  #onBoxDragOver = (event) => {
    this.#defaultHandleDragEvent(event);
    // update box border
    const box = this.#rootDoc.getElementById(this.#getDropboxDivId());
    if (box && box.className.indexOf(this.#hoverClassName) === -1) {
      box.className += ' ' + this.#hoverClassName;
    }
  };

  /**
   * Handle a drag leave.
   *
   * @param {object} event The event to handle.
   */
  #onBoxDragLeave = (event) => {
    this.#defaultHandleDragEvent(event);
    // update box border
    const box = this.#rootDoc.getElementById(this.#getDropboxDivId());
    if (box && box.className.indexOf(this.#hoverClassName) !== -1) {
      box.className = box.className.replace(' ' + this.#hoverClassName, '');
    }
  };

  /**
   * Handle a drop event.
   *
   * @param {object} event The event to handle.
   */
  #onDrop = (event) => {
    this.#defaultHandleDragEvent(event);
    // load files
    this.#dwvAppService.loadFiles(event.dataTransfer.files);
  };

  /**
   * Handle a an input[type:file] change event.
   *
   * @param {object} event The event to handle.
   */
  #onInputFile = (event) => {
    if (event.target && event.target.files) {
      this.#dwvAppService.loadFiles(event.target.files);
    }
  };

  /**
   * Show or hide the data load drop box.
   *
   * @param {boolean} show Flag to show or hide.
   */
  showDropbox(show) {
    const box = this.#rootDoc.getElementById(this.#getDropboxDivId());
    if (!box) {
      return;
    }
    const layerDiv =
      this.#rootDoc.getElementById(this.#viewerId + '-layerGroup');

    if (show) {
      // reset css class
      box.className = this.#dropboxClassName + ' ' + this.#borderClassName;
      // add content if empty
      if (box.innerHTML === '') {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode('Drag and drop data here or '));
        // input file
        const input = document.createElement('input');
        input.onchange = this.#onInputFile;
        input.type = 'file';
        input.multiple = true;
        input.id = this.#viewerId + '-input-file';
        input.style.display = 'none';
        const label = document.createElement('label');
        label.htmlFor = input.id;
        const link = document.createElement('a');
        link.appendChild(document.createTextNode('click here'));
        link.id = this.#viewerId + '-input-file-link';
        link.className = 'input-file-link';
        label.appendChild(link);
        p.appendChild(input);
        p.appendChild(label);

        box.appendChild(p);
      }
      // show box
      box.setAttribute('style', 'display:initial');
      // stop layer listening
      if (layerDiv) {
        layerDiv.removeEventListener('dragover', this.#defaultHandleDragEvent);
        layerDiv.removeEventListener('dragleave', this.#defaultHandleDragEvent);
        layerDiv.removeEventListener('drop', this.#onDrop);
      }
      // listen to box events
      box.addEventListener('dragover', this.#onBoxDragOver);
      box.addEventListener('dragleave', this.#onBoxDragLeave);
      box.addEventListener('drop', this.#onDrop);
    } else {
      // remove border css class
      box.className = this.#dropboxClassName;
      // remove content
      box.innerHTML = '';
      // hide box
      box.setAttribute('style', 'display:none');
      // stop box listening
      box.removeEventListener('dragover', this.#onBoxDragOver);
      box.removeEventListener('dragleave', this.#onBoxDragLeave);
      box.removeEventListener('drop', this.#onDrop);
      // listen to layer events
      if (layerDiv) {
        layerDiv.addEventListener('dragover', this.#defaultHandleDragEvent);
        layerDiv.addEventListener('dragleave', this.#defaultHandleDragEvent);
        layerDiv.addEventListener('drop', this.#onDrop);
      }
    }
  };
}; // class DropboxLoader
