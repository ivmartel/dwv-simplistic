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
  'Scroll': 'M110-215v-118h740v118H110Zm0-206v-118h740v118H110Zm0-206v-118h740v118H110Z"',
  // search
  'ZoomAndPan': 'M763-106 517-352q-29 18-64.292 28.5T376.035-313Q267-313 190-390t-77-186q0-109 77-186t186-77q109 0 186 77t77 186.035q0 42.381-10.5 76.673T600-437l247 248-84 83ZM376-431q61 0 103-42t42-103q0-61-42-103t-103-42q-61 0-103 42t-42 103q0 61 42 103t103 42Z',
  // contrast
  'WindowLevel': 'M480.192-62Q394-62 318-94.5q-76-32.5-133.5-90t-90-133.542Q62-394.083 62-480.542 62-567 94.5-642.5t90-133q57.5-57.5 133.542-90 76.041-32.5 162.5-32.5Q567-898 642.5-865.5t133 90q57.5 57.5 90 133.308 32.5 75.807 32.5 162Q898-394 865.5-318q-32.5 76-90 133.5t-133.308 90q-75.807 32.5-162 32.5ZM528-184q109-18 180.5-99.222T780-480q0-112.818-71.5-194.909T528-775v591Z',
  // straighten
  'Draw': 'M183-215q-49.7 0-83.85-34.15Q65-283.3 65-333v-294q0-49.7 34.15-83.85Q133.3-745 183-745h594q49.7 0 83.85 34.15Q895-676.7 895-627v294q0 49.7-34.15 83.85Q826.7-215 777-215H183Zm0-118h594v-294H672v147h-72v-147h-84v147h-72v-147h-84v147h-72v-147H183v294Zm105-147h72-72Zm156 0h72-72Zm156 0h72-72Zm-120 0Z',
  // refresh
  'Reset': 'M476-158q-133 0-227.5-94.5T154-480q0-133 94.5-227.5T476-802q74 0 136 30t106 82v-112h88v289H516v-87h125q-29-38-71.5-61T476-684q-85 0-144.5 59.5T272-480q0 85 59.5 144.5T476-276q78 0 134.5-52.5T677-456h121q-10 126-102 212t-220 86Z',
  // cameraswitch
  'ToggleOrientation': 'M327-273q-35.888 0-61.444-25.556Q240-324.112 240-360v-209q0-36.3 25.15-62.15T327-657h33l48-48h144l48 48h33q36.7 0 61.85 25.85T720-569v209q0 35.888-25.556 61.444Q668.888-273 633-273H327Zm0-87h306v-209H327v209Zm153.425-40Q507-400 525.5-419.133q18.5-19.132 18.5-46Q544-492 525.075-510.5q-18.925-18.5-45.5-18.5T434.5-510.075q-18.5 18.925-18.5 45.5T434.925-419q18.925 19 45.5 19ZM336-937q35.783-11.9 73.033-17.45Q446.283-960 485-960q91 0 173.5 33.5T805-835.275q64 57.725 104.544 136.5Q950.089-620 960-528H857q-8-61-34.5-115.5t-67-97q-40.5-42.5-94-71T547-851l46 47-60 62-197-195ZM624-23q-35.783 11.9-73.033 17.45Q513.717 0 475 0q-91.92 0-174.46-33.5t-146.04-91Q91-182 49.956-261 8.91-340 0-432h103q7 61 33.5 115.5t67.5 97q41 42.5 94.5 71T413-109l-46-47 60-62L624-23ZM482-466Z'
/* eslint-enable max-len */

/**
 * Get a tool html button.
 *
 * @param {string} toolName The tool name.
 * @param {object} appGui The associated GUi.
 * @returns An HTML button element.
 */
dwvsimple.getToolButton = function (toolName, appGui) {
  var xmlns = 'http://www.w3.org/2000/svg';
  var path = document.createElementNS(xmlns, 'path');
  path.setAttributeNS(null, 'd', _paths[toolName]);
  var svg = document.createElementNS(xmlns, 'svg');
  svg.setAttributeNS(null, 'height', 20);
  svg.setAttributeNS(null, 'width', 20);
  svg.setAttributeNS(null, 'viewBox', '0 -960 960 960');
  svg.appendChild(path);
  var button = document.createElement('button');
  button.id = toolName;
  button.title = toolName;
  button.appendChild(svg);
  if (toolName === 'Reset') {
    button.onclick = function () {
      appGui.onDisplayReset();
    };
  } else if (toolName === 'ToggleOrientation') {
    button.onclick = function () {
      appGui.toggleOrientation();
    };
  } else {
    button.onclick = function () {
      appGui.onChangeTool(toolName);
    };
  }
  return button;
};

/**
 * Get a tool html select.
 *
 * @param {string} toolName The tool name.
 * @param {object} appGui The associated GUi.
 * @returns An HTML select element.
 */
dwvsimple.getSelect = function (toolName, appGui) {
  var option = document.createElement('option');
  option.value = '';
  option.appendChild(document.createTextNode('Preset...'));
  var select = document.createElement('select');
  select.id = toolName;
  select.appendChild(option);
  select.onchange = function () {
    appGui.onChangePreset(this.value);
  };
  return select;
};

/**
 * GUI class.
 *
 * @class
 * @param {object} app The associated app.
 * @param {Array} tools The list of tools.
 */
dwvsimple.Gui = function (app, tools) {

  var self = this;

  // view orientation
  this.orientation;

  /**
   * Initialise the GUI: fill the toolbar.
   */
  this.init = function () {
    var toolbar = document.getElementById('toolbar');
    for (var i = 0; i < tools.length; ++i) {
      if (tools[i] === 'presets') {
        toolbar.appendChild(dwvsimple.getSelect(tools[i], self));
      } else {
        toolbar.appendChild(dwvsimple.getToolButton(tools[i], self));
      }
    }
  };

  /**
   * Enable or not a tool.
   *
   * @param {string} name The tool name.
   * @param {boolean} flag True to enable.
   */
  this.enableTool = function (name, flag) {
    document.getElementById(name).disabled = !flag;
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
    if (flag) {
      document.getElementById(name).classList.add('active');
    } else {
      document.getElementById(name).classList.remove('active');
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
    var domPresets = document.getElementById('presets');
    domPresets.selectedIndex = 0;
  };

  /**
   * Toggle the viewer orientation.
   */
  this.toggleOrientation = function () {
    if (typeof this.orientation !== 'undefined') {
      if (this.orientation === 'axial') {
        this.orientation = 'coronal';
      } else if (this.orientation === 'coronal') {
        this.orientation = 'sagittal';
      } else if (this.orientation === 'sagittal') {
        this.orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.orientation = 'coronal';
    }
    // update data view config
    var config = {
      '*': [
        {
          divId: 'layerGroup0',
          orientation: this.orientation
        }
      ]
    };
    app.setDataViewConfigs(config);
    // render data
    for (var i = 0; i < app.getNumberOfLoadedData(); ++i) {
      app.render(i);
    }
  };

}; // class dwvsimple.Gui

/**
 * Update preset dropdown.
 * @param {Array} presets The list of presets to use as options.
 */
dwvsimple.Gui.prototype.updatePresets = function (presets) {
  var domPresets = document.getElementById('presets');
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
  var domPresets = document.getElementById('presets');
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
