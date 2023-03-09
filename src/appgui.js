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
  'Scroll': 'M2.521 15.292v-2.459h14.958v2.459Zm0-4.063V8.771h14.958v2.458Zm0-4.062V4.708h14.958v2.459Z',
  // search
  'ZoomAndPan': 'm15.896 17.792-5.125-5.125q-.604.375-1.344.593-.739.219-1.594.219-2.271 0-3.875-1.604T2.354 8q0-2.271 1.604-3.875t3.875-1.604q2.271 0 3.875 1.604T13.312 8q0 .875-.218 1.594-.219.718-.594 1.302l5.146 5.166Zm-8.063-6.771q1.271 0 2.146-.875T10.854 8q0-1.271-.875-2.146t-2.146-.875q-1.271 0-2.145.875-.876.875-.876 2.146t.876 2.146q.874.875 2.145.875Z',
  // contrast
  'WindowLevel': 'M10 18.708q-1.792 0-3.375-.677t-2.781-1.875q-1.198-1.198-1.875-2.781-.677-1.583-.677-3.396 0-1.791.677-3.364t1.875-2.771q1.198-1.198 2.781-1.875 1.583-.677 3.396-.677 1.791 0 3.364.677t2.771 1.875q1.198 1.198 1.875 2.781.677 1.583.677 3.375t-.677 3.375q-.677 1.583-1.875 2.781-1.198 1.198-2.781 1.875-1.583.677-3.375.677Zm1-2.541q2.271-.375 3.76-2.063 1.49-1.687 1.49-4.104 0-2.354-1.49-4.062Q13.271 4.229 11 3.854Z',
  // refresh
  'reset': 'M9.917 16.708q-2.771 0-4.74-1.968Q3.208 12.771 3.208 10t1.969-4.74q1.969-1.968 4.74-1.968 1.541 0 2.833.625 1.292.625 2.208 1.708V3.292h1.834v6.02H10.75V7.5h2.604q-.604-.792-1.489-1.271-.886-.479-1.948-.479-1.771 0-3.011 1.24Q5.667 8.229 5.667 10q0 1.771 1.239 3.01 1.24 1.24 3.011 1.24 1.625 0 2.802-1.094t1.385-2.656h2.521q-.208 2.625-2.125 4.417-1.917 1.791-4.583 1.791Z'
};
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
  svg.appendChild(path);
  var button = document.createElement('button');
  button.id = toolName;
  button.title = toolName;
  button.appendChild(svg);
  if (toolName === 'reset') {
    button.onclick = function () {
      appGui.onDisplayReset();
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
