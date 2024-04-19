/**
 * Application GUI.
 */
// namespace
var dwvsimple = dwvsimple || {};

// icons from https://fonts.google.com/icons
// Fill: 0 Weight: 700 Grade: 0 Optical Size: 20
/* eslint-disable max-len */
var _paths = {
  // menu
  'Scroll': 'M110-215v-118h740v118H110Zm0-206v-118h740v118H110Zm0-206v-118h740v118H110Z',
  // search
  'ZoomAndPan': 'M763-106 517-352q-29 18-64.292 28.5T376.035-313Q267-313 190-390t-77-186q0-109 77-186t186-77q109 0 186 77t77 186.035q0 42.381-10.5 76.673T600-437l247 248-84 83ZM376-431q61 0 103-42t42-103q0-61-42-103t-103-42q-61 0-103 42t-42 103q0 61 42 103t103 42Z',
  // contrast
  'WindowLevel': 'M480.192-62Q394-62 318-94.5q-76-32.5-133.5-90t-90-133.542Q62-394.083 62-480.542 62-567 94.5-642.5t90-133q57.5-57.5 133.542-90 76.041-32.5 162.5-32.5Q567-898 642.5-865.5t133 90q57.5 57.5 90 133.308 32.5 75.807 32.5 162Q898-394 865.5-318q-32.5 76-90 133.5t-133.308 90q-75.807 32.5-162 32.5ZM528-184q109-18 180.5-99.222T780-480q0-112.818-71.5-194.909T528-775v591Z',
  // straighten
  'Draw': 'M183-215q-49.7 0-83.85-34.15Q65-283.3 65-333v-294q0-49.7 34.15-83.85Q133.3-745 183-745h594q49.7 0 83.85 34.15Q895-676.7 895-627v294q0 49.7-34.15 83.85Q826.7-215 777-215H183Zm0-118h594v-294H672v147h-72v-147h-84v147h-72v-147h-84v147h-72v-147H183v294Zm105-147h72-72Zm156 0h72-72Zm156 0h72-72Zm-120 0Z',
  // refresh
  'Reset': 'M476-158q-133 0-227.5-94.5T154-480q0-133 94.5-227.5T476-802q74 0 136 30t106 82v-112h88v289H516v-87h125q-29-38-71.5-61T476-684q-85 0-144.5 59.5T272-480q0 85 59.5 144.5T476-276q78 0 134.5-52.5T677-456h121q-10 126-102 212t-220 86Z',
  // cameraswitch
  'ToggleOrientation': 'M327-273q-35.888 0-61.444-25.556Q240-324.112 240-360v-209q0-36.3 25.15-62.15T327-657h33l48-48h144l48 48h33q36.7 0 61.85 25.85T720-569v209q0 35.888-25.556 61.444Q668.888-273 633-273H327Zm0-87h306v-209H327v209Zm153.425-40Q507-400 525.5-419.133q18.5-19.132 18.5-46Q544-492 525.075-510.5q-18.925-18.5-45.5-18.5T434.5-510.075q-18.5 18.925-18.5 45.5T434.925-419q18.925 19 45.5 19ZM336-937q35.783-11.9 73.033-17.45Q446.283-960 485-960q91 0 173.5 33.5T805-835.275q64 57.725 104.544 136.5Q950.089-620 960-528H857q-8-61-34.5-115.5t-67-97q-40.5-42.5-94-71T547-851l46 47-60 62-197-195ZM624-23q-35.783 11.9-73.033 17.45Q513.717 0 475 0q-91.92 0-174.46-33.5t-146.04-91Q91-182 49.956-261 8.91-340 0-432h103q7 61 33.5 115.5t67.5 97q41 42.5 94.5 71T413-109l-46-47 60-62L624-23ZM482-466Z',
  // open in full
  'Fullscreen': 'M110-110v-334h118v132l420-420H516v-118h334v334H732v-132L312-228h132v118H110Z',
  // tags
  'Tags': 'M406-405h177v-92H406v92Zm0-132h354v-92H406v92Zm0-132h354v-92H406v92Zm-51 440q-53 0-89.5-36.5T229-355v-456q0-53 36.5-89.5T355-937h456q53 0 89.5 36.5T937-811v456q0 53-36.5 89.5T811-229H355Zm0-126h456v-456H355v456ZM149-23q-53 0-89.5-36.5T23-149v-582h126v582h582v126H149Zm206-788v456-456Z'
};
/* eslint-enable max-len */

/**
 * Get a tool html button.
 *
 * @param {string} toolName The tool name.
 * @param {object} appGui The associated GUi.
 * @returns An HTML button element.
 */
function getToolButton(toolName, appGui) {
  var xmlns = 'http://www.w3.org/2000/svg';
  var path = document.createElementNS(xmlns, 'path');
  path.setAttributeNS(null, 'd', _paths[toolName]);
  var svg = document.createElementNS(xmlns, 'svg');
  svg.setAttributeNS(null, 'height', 20);
  svg.setAttributeNS(null, 'width', 20);
  svg.setAttributeNS(null, 'viewBox', '0 -960 960 960');
  svg.appendChild(path);
  var button = document.createElement('button');
  button.id = appGui.getToolId(toolName);
  button.title = toolName;
  button.appendChild(svg);
  // onclick callback
  if (toolName === 'Reset') {
    button.onclick = function () {
      appGui.onDisplayReset();
    };
  } else if (toolName === 'ToggleOrientation') {
    button.onclick = function () {
      appGui.toggleOrientation();
    };
  } else if (toolName === 'Fullscreen') {
    button.onclick = function () {
      appGui.toggleFullScreen();
    };
  } else if (toolName === 'Tags') {
    button.onclick = function () {
      appGui.openTagsModal();
    };
  } else {
    button.onclick = function () {
      appGui.onChangeTool(toolName);
    };
  }
  return button;
}

/**
 * Get a tool html select.
 *
 * @param {string} toolName The tool name.
 * @param {object} appGui The associated GUi.
 * @returns An HTML select element.
 */
function getSelect(toolName, appGui) {
  var option = document.createElement('option');
  option.value = '';
  option.appendChild(document.createTextNode('Preset...'));
  var select = document.createElement('select');
  select.id = appGui.getToolId(toolName);
  select.title = 'Window level presets';
  select.appendChild(option);
  select.onchange = function () {
    appGui.onChangePreset(this.value);
  };
  return select;
}

/**
 * GUI class.
 *
 * @class
 * @param {object} app The associated app.
 * @param {Array} tools The list of tools.
 * @param {string} uid The GUI unique id.
 */
dwvsimple.Gui = function (app, tools, uid) {

  var self = this;

  /**
   * View orientation
   *
   * @type {string}
   */
  var orientation;

  /**
   * Layer group div height before full screen.
   *
   * @type {string}
   */
  var lgDivHeight;

  /**
   * Initialise the GUI: fill the toolbar.
   */
  this.init = function () {
    var toolbar = document.getElementById('toolbar-' + uid);
    for (var i = 0; i < tools.length; ++i) {
      if (tools[i] === 'WindowLevelPresets') {
        toolbar.appendChild(getSelect(tools[i], self));
      } else {
        toolbar.appendChild(getToolButton(tools[i], self));
      }
    }
  };

  /**
   * Show the progress bar: adds a progress to the
   *   layerGroup div.
   */
  this.showProgressBar = function () {
    var progress = document.createElement('progress');
    progress.id = 'progress-' + uid;
    progress.max = '100';
    progress.value = '0';

    var lg = document.getElementById('toolbar-' + uid);
    lg.appendChild(progress);
  };

  /**
   * Set the progress: updates the progress bar,
   *   hides it if percent is 100
   * @param {number} percent The progess percent.
   */
  this.setProgress = function (percent) {
    var progress = document.getElementById('progress-' + uid);
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
  this.getDwvDivId = function () {
    return 'dwv-' + uid;
  };

  /**
   * Get the dwv div id.
   *
   * @returns {string} The id.
   */
  this.getLayerGroupDivId = function () {
    return 'layerGroup-' + uid;
  };

  /**
   * Get a tool id from its name.
   *
   * @param {string} toolName tool name.
   * @returns {string} The id.
   */
  this.getToolId = function (toolName) {
    return toolName.toLowerCase() + '-' + uid;
  };

  /**
   * Enable or not a tool.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to enable.
   */
  this.enableTool = function (name, flag) {
    var toolId = this.getToolId(name);
    document.getElementById(toolId).disabled = !flag;
  };

  /**
   * Enable or not all tools.
   *
   * @param {boolean} flag True to enable.
   */
  this.enableTools = function (flag) {
    for (var i = 0; i < tools.length; ++i) {
      this.enableTool(tools[i], flag);
    }
  };

  /**
   * Activate or not a tool.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to activate.
   */
  this.activateTool = function (name, flag) {
    var toolId = this.getToolId(name);
    if (flag) {
      document.getElementById(toolId).classList.add('active');
    } else {
      document.getElementById(toolId).classList.remove('active');
    }
  };

  /**
   * Activate or not all tool.
   *
   * @param {boolean} flag True to activate.
   */
  this.activateTools = function (flag) {
    for (var i = 0; i < tools.length; ++i) {
      this.activateTool(tools[i], flag);
    }
  };

  /**
   * Handle preset change.
   *
   * @param {string} name The name of the new preset.
   */
  this.onChangePreset = function (name) {
    // update viewer
    app.setWindowLevelPreset(name);
    // set selected
    this.setSelectedPreset(name);
  };

  /**
   * Handle tool change.
   *
   * @param {string} name The name of the new tool.
   */
  this.onChangeTool = function (name) {
    this.activateTools(false);
    this.activateTool(name, true);
    app.setTool(name);
    if (name === 'Draw') {
      app.setToolFeatures({shapeName: 'Ruler'});
    }
  };

  /**
   * Handle display reset.
   */
  this.onDisplayReset = function () {
    app.resetDisplay();
    // reset preset dropdown
    var presetsId = this.getToolId('WindowLevelPresets');
    var domPresets = document.getElementById(presetsId);
    domPresets.selectedIndex = 0;
  };

  /**
   * Toggle the viewer orientation.
   */
  this.toggleOrientation = function () {
    if (typeof orientation !== 'undefined') {
      if (orientation === 'axial') {
        orientation = 'coronal';
      } else if (orientation === 'coronal') {
        orientation = 'sagittal';
      } else if (orientation === 'sagittal') {
        orientation = 'axial';
      }
    } else {
      // default is most probably axial
      orientation = 'coronal';
    }
    // update data view config
    var config = {
      '*': [
        {
          divId: this.getLayerGroupDivId(),
          orientation: orientation
        }
      ]
    };
    app.setDataViewConfigs(config);
    // render data
    for (var i = 0; i < app.getNumberOfLoadedData(); ++i) {
      app.render(i);
    }
  };

  /**
   * Toogle full screen on and off.
   */
  this.toggleFullScreen = function () {
    var lgDivId = this.getLayerGroupDivId();
    var lgElement = document.getElementById(lgDivId);

    // the app listens on window resize (see applaucher
    // `window.addEventListener('resize', dwvApp.onResize);`)
    // -> no need to manually call app.fitToContainer

    if (!document.fullscreenElement) {
      var fsDivId = this.getDwvDivId();
      var fsElement = document.getElementById(fsDivId);
      fsElement.requestFullscreen().then(function () {
        // if the layer group height was 0, the app set it to a fixed size.
        // change it to 100% to trigger a resize and recalculate the
        // fit scale to occupy the full screen
        lgDivHeight = lgElement.style.height;
        lgElement.style.height = '100%';
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      // restore previous height
      lgElement.style.height = lgDivHeight;
    }
  };

  /**
   * Open a DICOM tags modal.
   */
  this.openTagsModal = function () {
    // modal
    var modalDiv = document.createElement('div');
    modalDiv.className = 'modal';
    modalDiv.id = 'modal-' + uid;
    modalDiv.style.display = 'block';
    // close on outside click
    window.onclick = function (event) {
      if (event.target === modalDiv) {
        modalDiv.style.display = 'none';
      }
    };

    var modalContentDiv = document.createElement('div');
    modalContentDiv.className = 'modal-content';
    modalContentDiv.id = 'modal-content-' + uid;
    modalDiv.appendChild(modalContentDiv);

    var modalTitle = document.createElement('h2');
    modalTitle.appendChild(document.createTextNode('DICOM Tags'));
    modalContentDiv.appendChild(modalTitle);

    // div with enabled scroll
    var modalScrollDiv = document.createElement('div');
    modalScrollDiv.className = 'modal-content-scroll';

    var metaData = app.getMetaData(0);

    // InstanceNumber
    var instanceElement = metaData['00200013'];
    var instanceNumbers;
    if (typeof instanceElement !== 'undefined') {
      // set slider with instance numbers ('00200013')
      var instanceNumberValue = instanceElement.value;
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

    var instanceNumber = instanceNumbers[0];

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'instancenumber-slider-' + uid;
    slider.min = 0;
    slider.max = instanceNumbers.length - 1;
    slider.value = 0;
    slider.title = 'Instance Number';
    var sliderLabel = document.createElement('label');
    sliderLabel.id = 'instancenumber-slider-label-' + uid;
    sliderLabel.for = slider.id;
    sliderLabel.appendChild(document.createTextNode(instanceNumber));
    sliderLabel.title = slider.title;

    var sliderLine = document.createElement('p');
    sliderLine.appendChild(slider);
    sliderLine.appendChild(sliderLabel);
    modalContentDiv.appendChild(sliderLine);

    slider.oninput = function (event) {
      instanceNumber = instanceNumbers[event.target.value];
      var metaArr = getMetaArray(metaData, instanceNumber);
      var metaTab = arrayToHtmlTable(metaArr);
      modalScrollDiv.replaceChildren(metaTab);
      sliderLabel.replaceChildren(document.createTextNode(instanceNumber));
    };

    // get meta data html table
    var metaArray = getMetaArray(metaData, instanceNumber);
    var metaTable = arrayToHtmlTable(metaArray);
    modalScrollDiv.appendChild(metaTable);
    modalContentDiv.appendChild(modalScrollDiv);

    // global container
    var container = document.getElementById(this.getDwvDivId());
    container.appendChild(modalDiv);
  };

}; // class dwvsimple.Gui

/**
 * Update preset dropdown.
 * @param {Array} presets The list of presets to use as options.
 */
dwvsimple.Gui.prototype.updatePresets = function (presets) {
  var presetsId = this.getToolId('WindowLevelPresets');
  var domPresets = document.getElementById(presetsId);
  // clear previous
  while (domPresets.hasChildNodes()) {
    domPresets.removeChild(domPresets.firstChild);
  }
  // add new
  for (var i = 0; i < presets.length; ++i) {
    var option = document.createElement('option');
    option.value = presets[i];
    var label = presets[i];
    option.appendChild(document.createTextNode(label));
    domPresets.appendChild(option);
  }
};

/**
 * Set the selected preset in the preset dropdown.
 * @param {string} name The name of the preset to select.
 */
dwvsimple.Gui.prototype.setSelectedPreset = function (name) {
  var presetsId = this.getToolId('WindowLevelPresets');
  var domPresets = document.getElementById(presetsId);
  // find the index
  var index = 0;
  for (index in domPresets.options) {
    if (domPresets.options[index].value === name) {
      break;
    }
  }
  // set selected
  domPresets.selectedIndex = index;
};

/**
 * Get an HTML table from a string array.
 *
 * @param {string[]} arr The input array.
 * @returns {HTMLTableElement} The HTML table element.
 */
function arrayToHtmlTable(arr) {
  var table = document.createElement('table');
  var row;
  var cell;

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
  var item0 = arr[0];
  var keys = Object.keys(item0);

  // table body
  for (var i = 0; i < arr.length; ++i) {
    row = table.insertRow(-1);
    for (var j = 0; j < keys.length; ++j) {
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(arr[i][keys[j]]));
      row.appendChild(cell);
    }
  }
  // table head
  var thead = table.createTHead();
  var th = thead.insertRow(-1);
  for (var k = 0; k < keys.length; ++k) {
    var hcell = document.createElement('th');
    var key = keys[k];
    key = key.charAt(0).toUpperCase() + key.slice(1);
    hcell.appendChild(document.createTextNode(key));
    th.appendChild(hcell);
  }

  return table;
}

/**
 * Get the meta data as an array.
 *
 * @param {any} meta
 * @param {number} instanceNumber
 * @returns {string[]} The meta data as a flat string array.
 */
function getMetaArray(meta, instanceNumber) {
  var reducer;
  if (isDicomMeta(meta)) {
    reducer = getDicomTagReducer(meta, instanceNumber, '');
  } else {
    reducer = getTagReducer(meta);
  }
  var keys = Object.keys(meta);
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
 * @returns {Function} The data recuder.
 */
function getDicomTagReducer(tagData, instanceNumber, prefix) {
  return function (accumulator, currentValue) {
    var tag = dwv.getTagFromKey(currentValue);
    var key = tag.getNameFromDictionary();
    if (typeof key === 'undefined') {
      // add 'x' to help sorting
      key = 'x' + tag.getKey();
    }
    var name = key;
    var element = tagData[currentValue];
    var value = element.value;
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
      for (var i = 0; i < value.length; ++i) {
        var sqItems = value[i];
        var keys = Object.keys(sqItems);
        var res = keys.reduce(
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
