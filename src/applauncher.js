import {
  App,
  WindowLevel
} from 'dwv';

import {Gui} from './appgui';
import {DropboxLoader} from './gui/dropboxLoader';

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
  // app options
  const appOptions = {
    dataViewConfigs: {'*': [{divId: 'layerGroup-' + uid}]},
    tools: {
      Scroll: {},
      ZoomAndPan: {},
      WindowLevel: {},
      Draw: {
        options: ['Ruler']
      }
    }
  };
  if (typeof rootDoc !== 'undefined') {
    appOptions.rootDocument = rootDoc;
  }
  // main application
  const dwvApp = new App();
  dwvApp.init(appOptions);

  // app gui
  const guiTools = Object.keys(appOptions.tools);
  const wlIndex = guiTools.indexOf('WindowLevel');
  if (wlIndex !== -1) {
    guiTools.splice(wlIndex + 1, 0, 'WindowLevelPresets');
  }
  guiTools.push('Reset');
  guiTools.push('ToggleOrientation');
  guiTools.push('Fullscreen');
  guiTools.push('Tags');
  const dwvAppGui = new Gui(dwvApp, guiTools, uid, rootDoc);
  dwvAppGui.init();
  dwvAppGui.enableTools(false);

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
  dwvApp.addEventListener('renderend', function (/*event*/) {
    if (isFirstRender) {
      isFirstRender = false;
      // enable tools
      dwvAppGui.enableTools(true);
      // set the selected tool
      let selectedTool = 'ZoomAndPan';
      if (dwvApp.canScroll()) {
        selectedTool = 'Scroll';
      } else {
        dwvAppGui.enableTool('Scroll', false);
      }
      if (!dwvApp.canWindowLevel()) {
        dwvAppGui.enableTool('WindowLevel', false);
      }
      dwvApp.setTool(selectedTool);
      dwvAppGui.activateTool(selectedTool, true);
      // update presets
      const lg = dwvApp.getActiveLayerGroup();
      const vl = lg.getActiveViewLayer();
      const viewController = vl.getViewController();
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
        viewController.addWindowLevelPresets(presets);
      }
      // update GUI
      dwvAppGui.updatePresets(
        viewController.getWindowLevelPresetsNames()
      );
      // select optional preset
      if (hasExtraPreset) {
        viewController.setWindowLevelPreset(wlpreset.name);
        dwvAppGui.setSelectedPreset(options.wlpreset.name);
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
    const vl = lg.getActiveViewLayer();
    const viewController = vl.getViewController();
    dwvAppGui.updatePresets(
      viewController.getWindowLevelPresetsNames()
    );
    // suppose it is a manual change so switch preset to manual
    dwvAppGui.setSelectedPreset('manual');
  });

  // load from options if defined
  if (typeof options !== 'undefined') {
    if (typeof options.uri !== 'undefined') {
      dwvApp.loadFromUri(options.uri);
    } else if (typeof options.urls !== 'undefined') {
      console.log('urls', options.urls);
      dwvApp.loadURLs(options.urls);
    } else {
      dropBoxLoader.showDropbox(true);
    }
  } else {
    dropBoxLoader.showDropbox(true);
  }
};
