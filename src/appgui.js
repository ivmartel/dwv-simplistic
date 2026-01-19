import {getTagFromKey} from 'dwv';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from 'dwv';
/* eslint-enable no-unused-vars */

// icons from https://fonts.google.com/icons
// Fill: 0 Weight: 700 Grade: 0 Optical Size: 20
/* eslint-disable @stylistic/js/max-len */
const _paths = {
  // menu
  Scroll: 'M110-215v-118h740v118H110Zm0-206v-118h740v118H110Zm0-206v-118h740v118H110Z',
  // search
  ZoomAndPan: 'M763-106 517-352q-29 18-64.292 28.5T376.035-313Q267-313 190-390t-77-186q0-109 77-186t186-77q109 0 186 77t77 186.035q0 42.381-10.5 76.673T600-437l247 248-84 83ZM376-431q61 0 103-42t42-103q0-61-42-103t-103-42q-61 0-103 42t-42 103q0 61 42 103t103 42Z',
  // contrast
  WindowLevel: 'M480.192-62Q394-62 318-94.5q-76-32.5-133.5-90t-90-133.542Q62-394.083 62-480.542 62-567 94.5-642.5t90-133q57.5-57.5 133.542-90 76.041-32.5 162.5-32.5Q567-898 642.5-865.5t133 90q57.5 57.5 90 133.308 32.5 75.807 32.5 162Q898-394 865.5-318q-32.5 76-90 133.5t-133.308 90q-75.807 32.5-162 32.5ZM528-184q109-18 180.5-99.222T780-480q0-112.818-71.5-194.909T528-775v591Z',
  // straighten
  Draw: 'M183-215q-49.7 0-83.85-34.15Q65-283.3 65-333v-294q0-49.7 34.15-83.85Q133.3-745 183-745h594q49.7 0 83.85 34.15Q895-676.7 895-627v294q0 49.7-34.15 83.85Q826.7-215 777-215H183Zm0-118h594v-294H672v147h-72v-147h-84v147h-72v-147h-84v147h-72v-147H183v294Zm105-147h72-72Zm156 0h72-72Zm156 0h72-72Zm-120 0Z',
  // refresh
  Reset: 'M476-158q-133 0-227.5-94.5T154-480q0-133 94.5-227.5T476-802q74 0 136 30t106 82v-112h88v289H516v-87h125q-29-38-71.5-61T476-684q-85 0-144.5 59.5T272-480q0 85 59.5 144.5T476-276q78 0 134.5-52.5T677-456h121q-10 126-102 212t-220 86Z',
  // cameraswitch
  ToggleOrientation: 'M327-273q-35.888 0-61.444-25.556Q240-324.112 240-360v-209q0-36.3 25.15-62.15T327-657h33l48-48h144l48 48h33q36.7 0 61.85 25.85T720-569v209q0 35.888-25.556 61.444Q668.888-273 633-273H327Zm0-87h306v-209H327v209Zm153.425-40Q507-400 525.5-419.133q18.5-19.132 18.5-46Q544-492 525.075-510.5q-18.925-18.5-45.5-18.5T434.5-510.075q-18.5 18.925-18.5 45.5T434.925-419q18.925 19 45.5 19ZM336-937q35.783-11.9 73.033-17.45Q446.283-960 485-960q91 0 173.5 33.5T805-835.275q64 57.725 104.544 136.5Q950.089-620 960-528H857q-8-61-34.5-115.5t-67-97q-40.5-42.5-94-71T547-851l46 47-60 62-197-195ZM624-23q-35.783 11.9-73.033 17.45Q513.717 0 475 0q-91.92 0-174.46-33.5t-146.04-91Q91-182 49.956-261 8.91-340 0-432h103q7 61 33.5 115.5t67.5 97q41 42.5 94.5 71T413-109l-46-47 60-62L624-23ZM482-466Z',
  // open in full
  Fullscreen: 'M110-110v-334h118v132l420-420H516v-118h334v334H732v-132L312-228h132v118H110Z',
  // tags
  Tags: 'M406-405h177v-92H406v92Zm0-132h354v-92H406v92Zm0-132h354v-92H406v92Zm-51 440q-53 0-89.5-36.5T229-355v-456q0-53 36.5-89.5T355-937h456q53 0 89.5 36.5T937-811v456q0 53-36.5 89.5T811-229H355Zm0-126h456v-456H355v456ZM149-23q-53 0-89.5-36.5T23-149v-582h126v582h582v126H149Zm206-788v456-456Z'
};
/* eslint-enable @stylistic/js/max-len */

/**
 * Get a SVG element for a given name.
 *
 * @param {string} name The key in the _paths list.
 * @returns {SVGSVGElement} The element.
 */
function getSvg(name) {
  const xmlns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(xmlns, 'path');
  path.setAttributeNS(null, 'd', _paths[name]);
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttributeNS(null, 'height', 20);
  svg.setAttributeNS(null, 'width', 20);
  svg.setAttributeNS(null, 'viewBox', '0 -960 960 960');
  svg.appendChild(path);
  return svg;
}

/**
 * Get a SVG button for a given name.
 *
 * @param {string} name The key in the _paths list.
 * @returns {HTMLButtonElement} The element.
 */
function getSvgButton(name) {
  const button = document.createElement('button');
  button.title = name;
  button.appendChild(getSvg(name));
  return button;
}

/**
 * Get a tool html button.
 *
 * @param {string} toolName The tool name.
 * @param {Gui} appGui The associated GUi.
 * @returns {HTMLButtonElement} An HTML button element.
 */
function getToolButton(toolName, appGui) {
  const button = getSvgButton(toolName);
  button.id = appGui.getToolId(toolName);

  // onclick callback
  if (toolName === 'Reset') {
    button.addEventListener('click', function () {
      appGui.onDisplayReset();
    });
  } else if (toolName === 'ToggleOrientation') {
    button.addEventListener('click', function () {
      appGui.toggleOrientation();
    });
  } else if (toolName === 'Fullscreen') {
    button.addEventListener('click', function () {
      appGui.toggleFullScreen();
    });
  } else if (toolName === 'Tags') {
    button.addEventListener('click', function () {
      appGui.openTagsModal();
    });
  } else {
    button.addEventListener('click', function () {
      appGui.onChangeTool(toolName);
    });
  }
  return button;
}

/**
 * Get a window level preset html select.
 *
 * @param {Gui} appGui The associated GUi.
 * @returns {HTMLSelectElement} An HTML select element.
 */
function getWindowLevelSelect(appGui) {
  const option = document.createElement('option');
  option.value = '';
  option.appendChild(document.createTextNode('Preset...'));
  const select = document.createElement('select');
  select.id = appGui.getToolId('WindowLevelPresets');
  select.title = 'Window level presets';
  select.appendChild(option);
  select.addEventListener('change', function () {
    appGui.onChangePreset(this.value);
  });
  return select;
}

/**
 * GUI class.
 */
export class Gui {

  /**
   * View this.#orientation.
   *
   * @type {string}
   */
  #orientation;

  /**
   * Layer group div height before full screen.
   *
   * @type {string}
   */
  #lgDivHeight;

  /**
   * The associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * The list of tool names.
   *
   * @type {string[]}
   */
  #toolNames;

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
   * @param {App} app The associated app.
   * @param {object[]} appTools The list of app tools.
   * @param {string[]} guiTools The list of gui tools.
   * @param {string} uid The GUI unique id.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(app, appTools, guiTools, uid, rootDoc) {
    this.#app = app;
    this.#uid = uid;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }

    // build tool names
    const tools = Object.keys(appTools);
    // add preset if we have window level
    const wlIndex = tools.indexOf('WindowLevel');
    if (wlIndex !== -1) {
      tools.splice(wlIndex + 1, 0, 'WindowLevelPresets');
    }
    this.#toolNames = tools.concat(guiTools);
  };

  /**
   * Initialise the GUI: fill the toolbar.
   */
  init() {
    const toolbar = this.#rootDoc.getElementById(this.getToolbarDivId());
    for (const toolName of this.#toolNames) {
      let element;
      if (toolName === 'WindowLevelPresets') {
        element = getWindowLevelSelect(this);
      } else {
        element = getToolButton(toolName, this);
      }
      toolbar.appendChild(element);
    }
  };

  /**
   * Show the progress bar: adds a progress to the
   *   layerGroup div.
   */
  showProgressBar() {
    const progress = document.createElement('progress');
    progress.id = 'progress-' + this.#uid;
    progress.max = '100';
    progress.value = '0';

    const lg = this.#rootDoc.getElementById(this.getToolbarDivId());
    lg.appendChild(progress);
  };

  /**
   * Set the progress: updates the progress bar,
   *   hides it if percent is 100.
   *
   * @param {number} percent The progess percent.
   */
  setProgress(percent) {
    const progress = this.#rootDoc.getElementById('progress-' + this.#uid);
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

  /**
   * Get the dwv div id.
   *
   * @returns {string} The id.
   */
  getDwvDivId() {
    return 'dwv-' + this.#uid;
  };

  /**
   * Get the layer group div id.
   *
   * @returns {string} The id.
   */
  getLayerGroupDivId() {
    return 'layerGroup-' + this.#uid;
  };

  /**
   * Get the toolbar div id.
   *
   * @returns {string} The id.
   */
  getToolbarDivId() {
    return 'toolbar-' + this.#uid;
  };

  /**
   * Get a tool id from its name.
   *
   * @param {string} toolName Tool name.
   * @returns {string} The id.
   */
  getToolId(toolName) {
    return toolName.toLowerCase() + '-' + this.#uid;
  };

  /**
   * Enable or not a tool.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to enable.
   */
  enableTool(name, flag) {
    const toolId = this.getToolId(name);
    this.#rootDoc.getElementById(toolId).disabled = !flag;
  };

  /**
   * Enable or not all tools.
   *
   * @param {boolean} flag True to enable.
   */
  enableTools(flag) {
    for (const toolName of this.#toolNames) {
      this.enableTool(toolName, flag);
    }
  };

  /**
   * Activate or not a tool.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to activate.
   */
  activateTool(name, flag) {
    const toolId = this.getToolId(name);
    if (flag) {
      this.#rootDoc.getElementById(toolId).classList.add('active');
    } else {
      this.#rootDoc.getElementById(toolId).classList.remove('active');
    }
  };

  /**
   * Activate or not all tool.
   *
   * @param {boolean} flag True to activate.
   */
  activateTools(flag) {
    for (const toolName of this.#toolNames) {
      this.activateTool(toolName, flag);
    }
  };

  /**
   * Handle preset change.
   *
   * @param {string} name The name of the new preset.
   */
  onChangePreset(name) {
    // update viewer
    const lg = this.#app.getActiveLayerGroup();
    const vl = lg.getViewLayersFromActive()[0];
    const vc = vl.getViewController();
    vc.setWindowLevelPreset(name);
    // set selected
    this.setSelectedPreset(name);
  };

  /**
   * Handle tool change.
   *
   * @param {string} name The name of the new tool.
   */
  onChangeTool(name) {
    this.activateTools(false);
    this.activateTool(name, true);
    this.#app.setTool(name);
    if (name === 'Draw') {
      this.#app.setToolFeatures({shapeName: 'Ruler'});
    } else {
      // if draw was created, active is now a draw layer...
      // reset to view layer
      const lg = this.#app.getActiveLayerGroup();
      lg?.setActiveLayer(0);
    }
  };

  /**
   * Handle display reset.
   */
  onDisplayReset() {
    this.#app.resetZoomPan();
    // reset window level
    const lg = this.#app.getActiveLayerGroup();
    const vl = lg.getViewLayersFromActive()[0];
    vl.getViewController().initialise();
    // reset preset dropdown
    const presetsId = this.getToolId('WindowLevelPresets');
    const domPresets = this.#rootDoc.getElementById(presetsId);
    domPresets.selectedIndex = 0;
  };

  /**
   * Toggle the viewer this.#orientation.
   */
  toggleOrientation() {
    if (typeof this.#orientation !== 'undefined') {
      if (this.#orientation === 'axial') {
        this.#orientation = 'coronal';
      } else if (this.#orientation === 'coronal') {
        this.#orientation = 'sagittal';
      } else if (this.#orientation === 'sagittal') {
        this.#orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.#orientation = 'coronal';
    }
    // update data view config
    const config = {
      '*': [
        {
          divId: this.getLayerGroupDivId(),
          orientation: this.#orientation
        }
      ]
    };
    this.#app.setDataViewConfigs(config);
    // render data
    const dataIds = this.#app.getDataIds();
    for (let i = 0; i < dataIds.length; ++i) {
      this.#app.render(dataIds[i]);
    }
  };

  /**
   * Toogle full screen on and off.
   */
  toggleFullScreen() {
    const lgDivId = this.getLayerGroupDivId();
    const lgElement = this.#rootDoc.getElementById(lgDivId);

    // the app listens on window resize (see applaucher
    // `window.addEventListener('resize', dwvApp.onResize);`)
    // -> no need to manually call app.fitToContainer

    if (!document.fullscreenElement) {
      const fsDivId = this.getDwvDivId();
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
   * Open the DICOM tags modal.
   */
  openTagsModal() {
    const modalId = 'modal-' + this.#uid;
    let modalDiv = this.#rootDoc.getElementById(modalId);

    // create div if not present
    if (!modalDiv) {
      modalDiv = this.#getTagsModal(modalId);
      // global container
      const container = this.#rootDoc.getElementById(this.getDwvDivId());
      container.appendChild(modalDiv);
    }

    // display modal
    modalDiv.style.display = 'block';
  };

  /**
   * Get the tags modal.
   *
   * @param {string} modalId The modal div id.
   * @returns {HTMLElement} The modal div.
   */
  #getTagsModal(modalId) {
    // create div
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal';
    modalDiv.id = modalId;
    modalDiv.style.display = 'block';
    // close on outside click
    this.#rootDoc.addEventListener('click', function (event) {
      if (event.target === modalDiv) {
        modalDiv.style.display = 'none';
      }
    });

    const modalContentDiv = document.createElement('div');
    modalContentDiv.className = 'modal-content';
    modalContentDiv.id = 'modal-content-' + this.#uid;
    modalDiv.appendChild(modalContentDiv);

    const modalTitle = document.createElement('h2');
    modalTitle.appendChild(document.createTextNode('DICOM Tags'));
    modalContentDiv.appendChild(modalTitle);

    // div with enabled scroll
    const modalScrollDiv = document.createElement('div');
    modalScrollDiv.className = 'modal-content-scroll';

    const metaData = this.#app.getMetaData('0');

    // InstanceNumber
    const instanceElement = metaData['00200013'];
    let instanceNumbers;
    if (typeof instanceElement !== 'undefined') {
      // set slider with instance numbers ('00200013')
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

    let instanceNumber = instanceNumbers[0];

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'instancenumber-slider-' + this.#uid;
    slider.min = 0;
    slider.max = instanceNumbers.length - 1;
    slider.value = 0;
    slider.title = 'Instance Number';
    const sliderLabel = document.createElement('label');
    sliderLabel.id = 'instancenumber-slider-label-' + this.#uid;
    sliderLabel.for = slider.id;
    sliderLabel.appendChild(document.createTextNode(instanceNumber));
    sliderLabel.title = slider.title;

    const sliderLine = document.createElement('p');
    sliderLine.appendChild(slider);
    sliderLine.appendChild(sliderLabel);
    modalContentDiv.appendChild(sliderLine);

    slider.addEventListener('input', function (event) {
      instanceNumber = instanceNumbers[event.target.value];
      const metaArr = getMetaArray(metaData, instanceNumber);
      const metaTab = arrayToHtmlTable(metaArr);
      modalScrollDiv.replaceChildren(metaTab);
      sliderLabel.replaceChildren(document.createTextNode(instanceNumber));
    });

    // get meta data html table
    const metaArray = getMetaArray(metaData, instanceNumber);
    const metaTable = arrayToHtmlTable(metaArray);
    modalScrollDiv.appendChild(metaTable);
    modalContentDiv.appendChild(modalScrollDiv);

    return modalDiv;
  };

  /**
   * Update preset dropdown.
   *
   * @param {string[]} presets The list of presets to use as options.
   */
  updatePresets(presets) {
    const presetsId = this.getToolId('WindowLevelPresets');
    const domPresets = this.#rootDoc.getElementById(presetsId);
    // clear previous
    while (domPresets.hasChildNodes()) {
      domPresets.removeChild(domPresets.firstChild);
    }
    // add new
    for (let i = 0; i < presets.length; ++i) {
      const option = document.createElement('option');
      option.value = presets[i];
      const label = presets[i];
      option.appendChild(document.createTextNode(label));
      domPresets.appendChild(option);
    }
  };

  /**
   * Set the selected preset in the preset dropdown.
   *
   * @param {string} name The name of the preset to select.
   */
  setSelectedPreset(name) {
    const presetsId = this.getToolId('WindowLevelPresets');
    const domPresets = this.#rootDoc.getElementById(presetsId);
    // find the index
    let index = 0;
    for (index in domPresets.options) {
      if (domPresets.options[index].value === name) {
        break;
      }
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

/**
 * Get the meta data as an array.
 *
 * @param {any} meta The meta data.
 * @param {number} instanceNumber The instance number.
 * @returns {string[]} The meta data as a flat string array.
 */
function getMetaArray(meta, instanceNumber) {
  let reducer;
  if (isDicomMeta(meta)) {
    reducer = getDicomTagReducer(meta, instanceNumber, '');
  } else {
    reducer = getTagReducer(meta);
  }
  const keys = Object.keys(meta);
  return keys.reduce(reducer, []);
}

/**
 * Check if a meta data is a dicom one.
 *
 * @param {any} meta The dicom meta data.
 * @returns {boolean} True if the meta data is a DICOM one.
 */
function isDicomMeta(meta) {
  // true if it has a Transfer Syntax
  return typeof meta['00020010'] !== 'undefined';
}

/**
 * Get a simple data array reducer.
 *
 * @param {any} tagData Simple data with a 'value' property.
 * @returns {Function} The data recuder.
 */
function getTagReducer(tagData) {
  return function (accumulator, currentValue) {
    accumulator.push({
      name: currentValue,
      value: tagData[currentValue].value
    });
    return accumulator;
  };
}

/**
 * Get a DICOM data array reducer.
 *
 * @param {any} tagData DICOM data.
 * @param {number} instanceNumber The instance number.
 * @param {string} prefix The prefix.
 * @returns {Function} The data reducer.
 */
function getDicomTagReducer(tagData, instanceNumber, prefix) {
  return function (accumulator, currentValue) {
    const tag = getTagFromKey(currentValue);
    let key = tag.getNameFromDictionary();
    if (typeof key === 'undefined') {
      // add 'x' to help sorting
      key = 'x' + tag.getKey();
    }
    const name = key;
    const element = tagData[currentValue];
    let value = element.value;
    // possible 'merged' object
    // (use slice method as test for array and typed array)
    if (typeof value.slice === 'undefined' &&
      typeof value[instanceNumber] !== 'undefined') {
      value = value[instanceNumber];
    }
    // force instance number (otherwise takes value in non indexed array)
    if (name === 'InstanceNumber') {
      value = instanceNumber;
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: ''
      });
      // sequence value
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i];
        const keys = Object.keys(sqItems);
        const res = keys.reduce(
          getDicomTagReducer(
            sqItems, instanceNumber, prefix + '[' + i + ']'), []
        );
        accumulator = accumulator.concat(res);
      }
    } else {
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 10) {
        value = value.slice(0, 10).toString() +
          '... (len:' + value.length + ')';
      }
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: value.toString()
      });
    }
    return accumulator;
  };
}
