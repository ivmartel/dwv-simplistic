import {
  App,
  WindowLevel
} from 'dwv';

import {Gui} from './appgui.js';
import {DropboxLoader} from './gui/dropboxLoader.js';

/**
 * Get the list of app and gui tools.
 *
 * @param {string} optionTools User tools.
 * @returns {object} App and gui Tools.
 */
function getTools(optionTools) {
  // optional user tools
  let userTools;
  if (typeof optionTools !== 'undefined') {
    userTools = optionTools.split(',').map(
      (item) => item.trim().toLowerCase()
    );
  }

  // app tools
  const defaultAppTools = {
    Scroll: {},
    ZoomAndPan: {},
    WindowLevel: {},
    Draw: {}
  };
  let appTools = {};
  if (typeof userTools !== 'undefined') {
    for (const toolName of Object.keys(defaultAppTools)) {
      if (userTools.includes(toolName.toLowerCase())) {
        appTools[toolName] = {};
      }
    }
    // in case none was found
    if (Object.keys(appTools).length === 0) {
      appTools = defaultAppTools;
    }
  } else {
    appTools = defaultAppTools;
  }

  // draw shapes
  const defaultShapeNames = [
    'Ruler',
    'Arrow',
    'Rectangle',
    'Circle',
    'Ellipse',
    'Protractor',
    'Roi'
  ];
  if (typeof appTools.Draw !== 'undefined') {
    appTools.Draw.options = defaultShapeNames;
  }

  // gui tools
  const guiTools = [
    'Reset',
    'ToggleOrientation',
    'Fullscreen',
    'Tags'
  ];

  return {appTools, guiTools};
}

/**
 * Application launcher.
 *
 * @param {string} uid The app uid.
 * @param {object} options Start options:
 * - uri (string): an URI with search parameters,
 * - urls (string[]): list of urls to load,
 * - wlpreset (object): default window level preset.
 * @param {Document} [rootDoc] Optional root document,
 *   defaults to `window.document`.
 */
export function startApp(uid, options, rootDoc) {
  // tools
  const {appTools, guiTools} = getTools(options.tools);
  // app options
  const appOptions = {
    dataViewConfigs: {'*': [{divId: 'layerGroup-' + uid}]},
    tools: appTools
  };
  if (typeof rootDoc !== 'undefined') {
    appOptions.rootDocument = rootDoc;
  }
  // main application
  const dwvApp = new App();
  dwvApp.init(appOptions);

  // app gui
  const dwvAppGui = new Gui(
    dwvApp, appOptions.tools, guiTools, uid, rootDoc);
  dwvAppGui.init();
  dwvAppGui.getToolbar().enableTools(false);

  // abort shortcut listener
  const abortOnCrtlX = function (event) {
    if (event.ctrlKey && event.keyCode === 88) {
      // crtl-x
      console.log('Abort load received from user (crtl-x).');
      dwvApp.abortLoad();
    }
  };

  // handle load events
  let nLoadItem;
  let nReceivedLoadError;
  let nReceivedLoadAbort;
  let isFirstRender;
  dwvApp.addEventListener('loadstart', function (/*event*/) {
    // reset counts
    nLoadItem = 0;
    nReceivedLoadError = 0;
    nReceivedLoadAbort = 0;
    isFirstRender = true;
    // allow to cancel via crtl-x
    window.addEventListener('keydown', abortOnCrtlX);
    // show progress bar
    dwvAppGui.showProgressBar();
  });
  dwvApp.addEventListener('loadprogress', function (event) {
    const percent = Math.ceil(event.loaded * 100 / event.total);
    // set progress (hides the bar is percent=100)
    dwvAppGui.setProgress(percent);
  });
  dwvApp.addEventListener('load', function (/*event*/) {
    // force hidding in case 100% progress was not sent
    dwvAppGui.setProgress(100);
  });
  dwvApp.addEventListener('loaditem', function (/*event*/) {
    ++nLoadItem;
  });
  dwvApp.addEventListener('renderend', function (event) {
    if (isFirstRender) {
      isFirstRender = false;
      const vl = dwvApp.getViewLayersByDataId(event.dataid)[0];
      const vc = vl.getViewController();
      const toolNames = Object.keys(appTools);
      // enable tools
      dwvAppGui.getToolbar().enableTools(true);
      // disable specific tools
      if (toolNames.includes('Scroll') && !vc.canScroll()) {
        dwvAppGui.getToolbar().enableTool('Scroll', false);
      }
      if (toolNames.includes('WindowLevel') && !vc.isMonochrome()) {
        dwvAppGui.getToolbar().enableTool('WindowLevel', false);
      }
      // set selected tool
      let selectedTool = toolNames[0];
      if (selectedTool === 'Scroll' &&
        !vc.canScroll() &&
        toolNames.length > 0) {
        selectedTool = toolNames[1];
      }
      dwvAppGui.getToolbar().activateTool(selectedTool, true);

      // optional wl preset
      let hasExtraPreset = false;
      let wlpreset;
      if (typeof options !== 'undefined' &&
        typeof options.wlpreset !== 'undefined') {
        hasExtraPreset = true;
        wlpreset = options.wlpreset;
        const presets = {};
        presets[wlpreset.name] = {
          wl: [new WindowLevel(wlpreset.center, wlpreset.width)],
          name: wlpreset.name
        };
        vc.addWindowLevelPresets(presets);
      }
      // update GUI
      if (toolNames.includes('WindowLevel')) {
        dwvAppGui.getToolbar().updatePresets(
          vc.getWindowLevelPresetsNames()
        );
      }
      // select optional preset
      if (hasExtraPreset) {
        vc.setWindowLevelPreset(wlpreset.name);
        if (toolNames.includes('WindowLevel')) {
          dwvAppGui.getToolbar().setSelectedPreset(options.wlpreset.name);
        }
      }
    }
  });
  dwvApp.addEventListener('error', function (event) {
    console.error(event.error);
    ++nReceivedLoadError;
  });
  dwvApp.addEventListener('abort', function (/*event*/) {
    ++nReceivedLoadAbort;
  });
  dwvApp.addEventListener('loadend', function (/*event*/) {
    // show alert for errors
    if (nReceivedLoadError) {
      let message = 'A load error has ';
      if (nReceivedLoadError > 1) {
        message = nReceivedLoadError + ' load errors have ';
      }
      message += 'occured. See log for details.';
      alert(message);
    }
    // console warn for aborts
    if (nReceivedLoadAbort !== 0) {
      console.warn('Data load was aborted.');
    }
    // stop listening for crtl-x
    window.removeEventListener('keydown', abortOnCrtlX);
  });

  // setup drop box
  const dropBoxLoader = new DropboxLoader(dwvApp, uid, rootDoc);
  dropBoxLoader.init();
  // show/hide drop box
  dwvApp.addEventListener('loadstart', function (/*event*/) {
    // hide drop box
    dropBoxLoader.showDropbox(false);
  });
  dwvApp.addEventListener('loadend', function (/*event*/) {
    // show the drop box if no item were received or
    // if the load was aborted
    if (!nLoadItem ||
      nReceivedLoadAbort !== 0) {
      dropBoxLoader.showDropbox(true);
    }
  });

  // handle key events
  dwvApp.addEventListener('keydown', function (event) {
    dwvApp.defaultOnKeydown(event);
  });
  // handle window resize
  window.addEventListener('resize', dwvApp.onResize);

  // listen to 'wlchange'
  dwvApp.addEventListener('wlchange', function (/*event*/) {
    // update presets (in case new was added)
    const lg = dwvApp.getActiveLayerGroup();
    const vl = lg.getViewLayersFromActive()[0];
    const viewController = vl.getViewController();
    dwvAppGui.getToolbar().updatePresets(
      viewController.getWindowLevelPresetsNames()
    );
    // suppose it is a manual change so switch preset to manual
    dwvAppGui.getToolbar().setSelectedPreset('manual');
  });

  // load from options if defined
  if (typeof options !== 'undefined') {
    if (typeof options.uri !== 'undefined') {
      dwvApp.loadFromUri(options.uri);
    } else if (typeof options.urls !== 'undefined') {
      dwvApp.loadURLs(options.urls);
    } else {
      dropBoxLoader.showDropbox(true);
    }
  } else {
    dropBoxLoader.showDropbox(true);
  }
};
