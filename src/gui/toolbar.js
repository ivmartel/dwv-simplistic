import {
  getDwvDivId,
  getHeaderDivId,
  getLayerGroupDivId
} from '../appgui.js';
import {getMetaArray} from './meta.js';
import {Modal} from './modal.js';
import {
  getButton,
  getIconElement
} from './icons.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DwvService} from '../dwv.service.js';
/* eslint-enable no-unused-vars */

/**
 * Get a tool html button.
 *
 * @param {string} toolName The tool name.
 * @param {Toolbar} toolbar The associated GUi.
 * @returns {HTMLButtonElement} An HTML button element.
 */
function getToolButton(toolName, toolbar) {
  let name = toolName;
  if (name === 'Draw') {
    name = toolbar.getSelectedShape();
  }
  const button = getButton(name);
  button.id = toolbar.getToolId(toolName);

  // onclick callback
  if (toolName === 'Reset') {
    button.addEventListener('click', function () {
      toolbar.onDisplayReset();
    });
  } else if (toolName === 'ToggleOrientation') {
    button.addEventListener('click', function () {
      toolbar.toggleOrientation();
    });
  } else if (toolName === 'Fullscreen') {
    button.addEventListener('click', function () {
      toolbar.toggleFullScreen();
    });
  } else if (toolName === 'Tags') {
    button.addEventListener('click', function () {
      toolbar.openTagsModal();
    });
  } else {
    button.addEventListener('click', function () {
      toolbar.onChangeTool(toolName);
    });
  }
  return button;
}

/**
 * Get a window level preset html div.
 *
 * @param {Toolbar} toolbar The associated GUi.
 * @returns {HTMLDivElement} An HTML div element.
 */
function getWindowLevelSelect(toolbar) {
  // select
  const select = document.createElement('select');
  select.id = toolbar.getToolId(toolbar.getToolExtra('WindowLevel'));
  select.title = 'WindowLevel presets';
  select.addEventListener('change', function () {
    toolbar.onChangePreset(this.value);
  });
  // select wrapper (only arrow)
  const div = document.createElement('div');
  div.className = 'select-wrapper';
  div.appendChild(getButton('ArrowDown'));
  div.appendChild(select);

  return div;
}

/**
 * Get a draw shape html div.
 *
 * @param {Toolbar} toolbar The associated GUi.
 * @returns {HTMLDivElement} An HTML div element.
 */
function getDrawSelect(toolbar) {
  // select
  const select = document.createElement('select');
  select.id = toolbar.getToolId(toolbar.getToolExtra('Draw'));
  select.title = 'Draw shapes';
  select.addEventListener('change', function () {
    toolbar.onChangeShape(this.value);
  });
  // draw shapes
  const shapes = toolbar.getDrawShapes();
  for (const shape of shapes) {
    const option = document.createElement('option');
    option.value = shape;
    option.appendChild(document.createTextNode(shape));
    select.appendChild(option);
  }
  // select wrapper (only arrow)
  const div = document.createElement('div');
  div.className = 'select-wrapper';
  div.appendChild(getButton('ArrowDown'));
  div.appendChild(select);

  return div;
}

/**
 * Get the tool elements.
 *
 * @param {string} toolName The tool name.
 * @param {Toolbar} toolbar The associated GUi.
 * @returns {HTMLElement[]} A list of HTML elements.
 */
function getToolElements(toolName, toolbar) {
  const elements = [];

  // button
  elements.push(getToolButton(toolName, toolbar));
  // extra
  if (toolName === 'WindowLevel') {
    elements.push(getWindowLevelSelect(toolbar));
  } else if (toolName === 'Draw') {
    elements.push(getDrawSelect(toolbar));
  }

  return elements;
}

/**
 * Get a toolbar item div.
 *
 * @param {string} toolName The tool name.
 * @param {Toolbar} toolbar The associated GUi.
 * @returns {HTMLDivElement} An HTML div element.
 */
function getToolbarItem(toolName, toolbar) {
  const div = document.createElement('div');
  div.className = 'toolbar-item';

  const toolElements = getToolElements(toolName, toolbar);
  for (const element of toolElements) {
    div.appendChild(element);
  }

  return div;
}

/**
 * Toolbar class.
 */
export class Toolbar {

  /**
   * Layer group div height before full screen.
   *
   * @type {string}
   */
  #lgDivHeight;

  /**
   * The dwv service.
   *
   * @type {DwvService}
   */
  #dwvService;

  /**
   * The list of all tool names.
   *
   * @type {string[]}
   */
  #toolNames;

  /**
   * The list of GUI tool names.
   *
   * @type {string[]}
   */
  #guiToolNames;

  /**
   * List of tool extra names.
   *
   * @type {object}
   */
  #toolExtras = {};

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
   * List of draw shapes.
   *
   * @type {string[]}
   */
  #shapes;

  /**
   * Selected annotation shape name.
   *
   * @type {string}
   */
  #selectedShape;

  /**
   * Selected window level preset.
   *
   * @type {string}
   */
  #selectedPreset;

  /**
   * Modal dialog.
   *
   * @type {Modal}
   */
  #modal;

  /**
   * @param {DwvService} dwvService The dwv service.
   * @param {string[]} optionGuiTools The list of gui tools.
   */
  constructor(dwvService, optionGuiTools) {
    this.#dwvService = dwvService;
    this.#uid = dwvService.getOptions().uid;
    this.#rootDoc = dwvService.getOptions().rootDocument;

    // default gui tools
    const defaultGuiTools = [
      'Reset',
      'ToggleOrientation',
      'Fullscreen',
      'Tags'
    ];
    if (typeof optionGuiTools !== 'undefined') {
      this.#guiToolNames = optionGuiTools.filter(
        item => defaultGuiTools.includes(item)
      );
    } else {
      this.#guiToolNames = defaultGuiTools;
    }

    // build tool names
    const appToolNames = dwvService.getToolNames();
    this.#toolNames = appToolNames.concat(this.#guiToolNames);

    if (appToolNames.includes('WindowLevel')) {
      this.#toolExtras['WindowLevel'] = 'WindowLevelPresets';
    }
    if (appToolNames.includes('Draw')) {
      this.#toolExtras['Draw'] = 'DrawShapes';
      this.#shapes = dwvService.getShapeNames();
      this.#selectedShape = this.#shapes[0];
    }

    // modal dialog
    this.#modal = new Modal(this.#uid, this.#rootDoc);

    // watch data ready
    this.#dwvService.addEventListener('dataready', (event) => {
      const dataReady = event.detail.value;
      if (dataReady) {
        // enable tools
        this.#enableToolUIs();

        // activate first runnable
        const runnableTool = this.#dwvService.getFirstRunnableTool();
        if (runnableTool !== undefined) {
          this.applyTool(runnableTool);
        }

        // option preset is default if preset
        const presetName = this.#dwvService.getOptionWlPresetName();
        if (typeof presetName !== 'undefined') {
          this.setSelectedPreset(presetName);
        }
      }
    });
    // watch preset names
    this.#dwvService.addEventListener('presetnames', (event) => {
      this.addPresetOptions(event.detail.value);
    });
    // watch is manual preset
    this.#dwvService.addEventListener('ismanualpreset', (event) => {
      const isManual = event.detail.value;
      const preset = this.#selectedPreset;
      const manualStr = 'manual';
      if (isManual && preset !== manualStr) {
        this.setSelectedPreset(manualStr);
      }
    });
  };

  /**
   * Get the name of the extra of a tool.
   *
   * @param {string} toolName The tool name.
   * @returns {string|undefined} The name of the extra.
   */
  getToolExtra(toolName) {
    return this.#toolExtras[toolName];
  }

  /**
   * Get the list of draw shapes.
   *
   * @returns {string[]} The shape names.
   */
  getDrawShapes() {
    return this.#shapes;
  }

  /**
   * Get the current selected shape.
   *
   * @returns {string|undefined} The shape name.
   */
  getSelectedShape() {
    return this.#selectedShape;
  }

  /**
   * Initialise the GUI: fill the header toolbar.
   */
  init() {
    const header = this.#rootDoc.getElementById(
      getHeaderDivId(this.#uid));
    for (const toolName of this.#toolNames) {
      header.appendChild(getToolbarItem(toolName, this));
      // disable tool
      this.#enableToolUI(toolName, false);
    }
    // init modal
    this.#modal.init();
  };

  /**
   * Get a tool id from its name.
   *
   * @param {string} toolName Tool name.
   * @returns {string} The id.
   */
  getToolId(toolName) {
    let res;
    if (typeof toolName !== 'undefined') {
      res = toolName.toLowerCase() + '-' + this.#uid;
    }
    return res;
  };

  /**
   * Handle tool change.
   *
   * @param {string} name The name of the new tool.
   */
  onChangeTool(name) {
    this.applyTool(name);
  };

  /**
   * Handle shape change.
   *
   * @param {string} name The name of the new shape.
   */
  onChangeShape(name) {
    // save
    this.#selectedShape = name;
    // apply
    this.applyShape(name);

    // update draw button to show shape
    const toolId = this.getToolId('Draw');
    const button = this.#rootDoc.querySelector('#' + toolId);
    button.innerHTML = '';
    button.appendChild(getIconElement(name));
    button.title = name;
  }

  /**
   * Handle preset change.
   *
   * @param {string} name The name of the new preset.
   */
  onChangePreset(name) {
    // save
    this.setSelectedPreset(name);
    // apply
    this.applyPreset(name);
  };

  /**
   * Apply a tool.
   *
   * @param {string} tool The tool name.
   * @param {object} [features] Optional tool features.
   */
  applyTool(tool, features) {
    // apply
    if (typeof features === 'undefined' && tool === 'Draw') {
      features = {shapeName: this.#selectedShape};
    }
    this.#dwvService.applyTool(tool, features);

    // deactivate all
    this.#markAllToolUIsAsActive(false);
    // activate input tool
    this.#markToolUIAsActive(tool, true);
  }

  /**
   * Apply a draw shape.
   *
   * @param {string} shape The shape name.
   */
  applyShape(shape) {
    this.applyTool('Draw', {shapeName: shape});
  }

  /**
   * Apply a window level preset.
   *
   * @param {string} preset The preset name.
   */
  applyPreset(preset) {
    this.#dwvService.applyPreset(preset);
  }

  /**
   * Enable or not a tool UI.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to enable.
   */
  #enableToolUI(name, flag) {
    if (!this.#toolNames.includes(name)) {
      return;
    }
    const toolId = this.getToolId(name);
    this.#rootDoc.getElementById(toolId).disabled = !flag;

    // enable extra
    const extraName = this.getToolExtra(name);
    if (typeof extraName !== 'undefined') {
      const selectId = this.getToolId(extraName);
      const select = this.#rootDoc.getElementById(selectId);
      select.disabled = !flag;
      // select button
      select.previousElementSibling.disabled = !flag;
    }
  };

  /**
   * Enable or not tool UIs.
   */
  #enableToolUIs() {
    for (const toolName of this.#toolNames) {
      let canRun;
      if (this.#guiToolNames.includes(toolName)) {
        canRun = true;
      } else {
        canRun = this.#dwvService.canRunTool(toolName);
      }
      this.#enableToolUI(toolName, canRun);
    }
  };

  /**
   * Mark a tool UI as active or not.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to activate.
   */
  #markToolUIAsActive(name, flag) {
    if (!this.#toolNames.includes(name)) {
      return;
    }
    const toolId = this.getToolId(name);
    const toolElement = this.#rootDoc.getElementById(toolId);
    if (flag) {
      toolElement.classList.add('active');
    } else {
      toolElement.classList.remove('active');
    }
  };

  /**
   * Mark all tool UIs as active or not.
   *
   * @param {boolean} flag True to activate.
   */
  #markAllToolUIsAsActive(flag) {
    for (const toolName of this.#toolNames) {
      this.#markToolUIAsActive(toolName, flag);
    }
  };

  /**
   * Handle display reset.
   */
  onDisplayReset() {
    this.#dwvService.reset();
  };

  /**
   * Toggle the viewer this.#orientation.
   */
  toggleOrientation() {
    this.#dwvService.toggleOrientation();
  };

  /**
   * Toogle full screen on and off.
   */
  toggleFullScreen() {
    const lgDivId = getLayerGroupDivId(this.#uid);
    const lgElement = this.#rootDoc.getElementById(lgDivId);

    // the app listens on window resize (see applaucher
    // `window.addEventListener('resize', dwvApp.onResize);`)
    // -> no need to manually call app.fitToContainer

    if (!document.fullscreenElement) {
      const fsDivId = getDwvDivId(this.#uid);
      const fsElement = this.#rootDoc.getElementById(fsDivId);
      fsElement.requestFullscreen().then(() => {
        // if the layer group height was 0, the app set it to a fixed size.
        // change it to 100% to trigger a resize and recalculate the
        // fit scale to occupy the full screen
        this.#lgDivHeight = lgElement.style.height;
        lgElement.style.height = '100%';
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      // restore previous height
      lgElement.style.height = this.#lgDivHeight;
    }
  };

  /**
   * Get a slider div with a slider and value.
   *
   * @param {string} id The slider id.
   * @param {string} title The slider title.
   * @param {number[]} values The slider values.
   * @param {Function} callback The slider change callback.
   * @returns {HTMLDivElement} The slider div.
   */
  #getSliderDiv(id, title, values, callback) {
    // slider input
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.title = title;
    slider.min = 0;
    slider.max = values.length - 1;
    slider.value = 0;
    // slider label
    const sliderLabel = document.createElement('label');
    sliderLabel.id = id + '-label';
    sliderLabel.for = slider.id;
    sliderLabel.appendChild(document.createTextNode(values[slider.value]));
    sliderLabel.title = slider.title;
    // navigate in values
    slider.addEventListener('input', function (event) {
      const value = values[event.target.value];
      sliderLabel.replaceChildren(document.createTextNode(value));
      // call input callback
      callback(value);
    });
    // container div
    const sliderDiv = document.createElement('div');
    sliderDiv.appendChild(slider);
    sliderDiv.appendChild(sliderLabel);

    return sliderDiv;
  }

  /**
   * Open the DICOM tags modal.
   */
  openTagsModal() {
    const content = this.#getTagsModalContent();
    this.#modal.open(content);
  };

  /**
   * Get the tags modal content.
   *
   * @returns {HTMLElement[]} The modal content.
   */
  #getTagsModalContent() {
    // title
    const modalTitle = document.createElement('h2');
    modalTitle.appendChild(document.createTextNode('DICOM Tags'));

    // TODO allow for different dataid
    const metaData = this.#dwvService.getMetaData();

    // InstanceNumber
    const instanceElement = metaData['00200013'];
    // list of possible instance numbers
    let instanceNumbers;
    if (typeof instanceElement !== 'undefined') {
      let instanceNumberValue = instanceElement.value;
      if (typeof instanceNumberValue === 'string') {
        instanceNumberValue = [instanceNumberValue];
      }
      // convert string to numbers
      instanceNumbers = instanceNumberValue.map(Number);
      // sort
      instanceNumbers.sort(function (a, b) {
        return a - b;
      });
    }

    // div with enabled scroll
    const modalScrollDiv = document.createElement('div');
    modalScrollDiv.className = 'modal-content-scroll';

    // slider
    const sliderCb = function (value) {
      const metaArr = getMetaArray(metaData, value);
      const metaTab = arrayToHtmlTable(metaArr);
      modalScrollDiv.replaceChildren(metaTab);
    };
    const sliderDiv = this.#getSliderDiv(
      'instancenumber-slider-' + this.#uid,
      'Instance Number',
      instanceNumbers,
      sliderCb
    );

    // meta data html table
    const instanceNumber = instanceNumbers[0];
    const metaArray = getMetaArray(metaData, instanceNumber);
    const metaTable = arrayToHtmlTable(metaArray);
    modalScrollDiv.appendChild(metaTable);

    return [modalTitle, sliderDiv, modalScrollDiv];
  };

  /**
   * Add preset HTML options to select.
   *
   * @param {string[]} presets The list of presets to use as options.
   */
  addPresetOptions(presets) {
    if (!this.#toolNames.includes('WindowLevel')) {
      return;
    }
    const extraName = this.getToolExtra('WindowLevel');
    if (typeof extraName === 'undefined') {
      return;
    }
    const presetsId = this.getToolId(extraName);
    const domPresets = this.#rootDoc.getElementById(presetsId);
    // clear previous
    while (domPresets.hasChildNodes()) {
      domPresets.removeChild(domPresets.firstChild);
    }
    // add new
    for (const preset of presets) {
      domPresets.appendChild(
        this.#getHTMLOption(preset)
      );
    }
  };

  /**
   * Get a HTML option element for a input string.
   *
   * @param {string} name The input name.
   * @returns {HTMLOptionElement} The option element.
   */
  #getHTMLOption(name) {
    const option = document.createElement('option');
    option.value = name;
    option.appendChild(document.createTextNode(name));
    return option;
  }

  /**
   * Set the selected preset in the preset dropdown.
   *
   * @param {string} name The name of the preset to select.
   */
  setSelectedPreset(name) {
    if (!this.#toolNames.includes('WindowLevel')) {
      return;
    }

    this.#selectedPreset = name;

    const extraName = this.getToolExtra('WindowLevel');
    if (typeof extraName === 'undefined') {
      return;
    }
    const presetsId = this.getToolId(extraName);
    const domPresets = this.#rootDoc.getElementById(presetsId);
    // find the index
    let index = 0;
    for (const option of domPresets.options) {
      if (option.value === name) {
        break;
      }
      ++index;
    }
    // add if not present
    if (index === domPresets.options.length) {
      domPresets.appendChild(
        this.#getHTMLOption(name)
      );
    }
    // set selected
    domPresets.selectedIndex = index;
  };

}; // class Gui

/**
 * Get an HTML table from a string array.
 *
 * @param {string[]} arr The input array.
 * @returns {HTMLTableElement} The HTML table element.
 */
function arrayToHtmlTable(arr) {
  const table = document.createElement('table');
  let row;
  let cell;

  // check input
  if (typeof arr === 'undefined' ||
    arr.length === 0) {
    row = table.insertRow(-1);
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode('Empty input array...'));
    row.appendChild(cell);
    return table;
  }

  // extract keys from first element
  const item0 = arr[0];
  const keys = Object.keys(item0);

  // table body
  for (let i = 0; i < arr.length; ++i) {
    row = table.insertRow(-1);
    for (let j = 0; j < keys.length; ++j) {
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(arr[i][keys[j]]));
      row.appendChild(cell);
    }
  }
  // table head
  const thead = table.createTHead();
  const th = thead.insertRow(-1);
  for (let k = 0; k < keys.length; ++k) {
    const hcell = document.createElement('th');
    let key = keys[k];
    key = key.charAt(0).toUpperCase() + key.slice(1);
    hcell.appendChild(document.createTextNode(key));
    th.appendChild(hcell);
  }

  return table;
}