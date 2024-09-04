// doc imports
/* eslint-disable no-unused-vars */
import {App} from 'dwv';
/* eslint-enable no-unused-vars */

/**
 * Dropbox loader.
 * Listens to drag events on the layer container and
 *   uses a drop box element as first display.
 *
 * @class
 */
export class DropboxLoader {

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

  // drop box class name
  #dropboxDivId = 'dropBox';
  #dropboxClassName = 'dropBox';
  #borderClassName = 'dropBoxBorder';
  #hoverClassName = 'hover';

  /**
   * @param {App} app The associated application.
   * @param {string} uid The GUI UID.
   */
  constructor(app, uid) {
    this.#app = app;
    this.#uid = uid;
  }

  /**
   * Initialise the drop box.
   */
  init() {
    this.showDropbox(true);
  };

  /**
   * Basic handle drag event.
   *
   * @private
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
   * @private
   * @param {object} event The event to handle.
   */
  #onBoxDragOver = (event) => {
    this.#defaultHandleDragEvent(event);
    // update box border
    var box = document.getElementById(this.#dropboxDivId);
    if (box && box.className.indexOf(this.#hoverClassName) === -1) {
      box.className += ' ' + this.#hoverClassName;
    }
  };

  /**
   * Handle a drag leave.
   *
   * @private
   * @param {object} event The event to handle.
   */
  #onBoxDragLeave = (event) => {
    this.#defaultHandleDragEvent(event);
    // update box border
    var box = document.getElementById(this.#dropboxDivId);
    if (box && box.className.indexOf(this.#hoverClassName) !== -1) {
      box.className = box.className.replace(' ' + this.#hoverClassName, '');
    }
  };

  /**
   * Handle a drop event.
   *
   * @private
   * @param {object} event The event to handle.
   */
  #onDrop = (event) => {
    this.#defaultHandleDragEvent(event);
    // load files
    this.#app.loadFiles(event.dataTransfer.files);
  };

  /**
   * Handle a an input[type:file] change event.
   *
   * @param {object} event The event to handle.
   */
  #onInputFile = (event) => {
    if (event.target && event.target.files) {
      this.#app.loadFiles(event.target.files);
    }
  };

  /**
   * Show or hide the data load drop box.
   *
   * @param {boolean} show Flag to show or hide.
   */
  showDropbox(show) {
    var box = document.getElementById(this.#dropboxDivId);
    if (!box) {
      return;
    }
    var layerDiv = document.getElementById('layerGroup-' + this.#uid);

    if (show) {
      // reset css class
      box.className = this.#dropboxClassName + ' ' + this.#borderClassName;
      // add content if empty
      if (box.innerHTML === '') {
        var p = document.createElement('p');
        p.appendChild(document.createTextNode('Drag and drop data here or '));
        // input file
        var input = document.createElement('input');
        input.onchange = this.#onInputFile;
        input.type = 'file';
        input.multiple = true;
        input.id = 'input-file';
        input.style.display = 'none';
        var label = document.createElement('label');
        label.htmlFor = 'input-file';
        var link = document.createElement('a');
        link.appendChild(document.createTextNode('click here'));
        link.id = 'input-file-link';
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
}; // DropboxLoader
