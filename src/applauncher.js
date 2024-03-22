// namespace
var dwvsimple = dwvsimple || {};

// Image decoders (for web workers)
dwv.decoderScripts.jpeg2000 =
  'node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js';
dwv.decoderScripts['jpeg-lossless'] =
  'node_modules/dwv/decoders/rii-mango/decode-jpegloss.js';
dwv.decoderScripts['jpeg-baseline'] =
  'node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js';
dwv.decoderScripts.rle = 'node_modules/dwv/decoders/dwv/decode-rle.js';

/**
 * Application launcher.
 *
 * @param {string} uid The app uid.
 * @param {object} [options] Start options:
 * - urls (string[]): list of urls to load
 * - wlpreset (object): default window level preset
 */
function startApp(uid, options) {
  // app options
  var appOptions = {
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
  // main application
  var dwvApp = new dwv.App();
  dwvApp.init(appOptions);

  // app gui
  var guiTools = Object.keys(appOptions.tools);
  var wlIndex = guiTools.indexOf('WindowLevel');
  if (wlIndex !== -1) {
    guiTools.splice(wlIndex + 1, 0, 'presets');
  }
  guiTools.push('Reset');
  guiTools.push('ToggleOrientation');
  guiTools.push('Fullscreen');
  var dwvAppGui = new dwvsimple.Gui(dwvApp, guiTools, uid);
  dwvAppGui.init();
  dwvAppGui.enableTools(false);

  // abort shortcut listener
  var abortOnCrtlX = function (event) {
    if (event.ctrlKey && event.keyCode === 88) {
      // crtl-x
      console.log('Abort load received from user (crtl-x).');
      dwvApp.abortLoad();
    }
  };

  // handle load events
  var nLoadItem = null;
  var nReceivedLoadError = null;
  var nReceivedLoadAbort = null;
  var isFirstRender = null;
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
    var percent = Math.ceil(event.loaded * 100 / event.total);
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
      var selectedTool = 'ZoomAndPan';
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
      var lg = dwvApp.getActiveLayerGroup();
      var vl = lg.getActiveViewLayer();
      var viewController = vl.getViewController();
      // optional wl preset
      var hasExtraPreset = false;
      if (typeof options !== 'undefined' &&
        typeof options.wlpreset !== 'undefined') {
        hasExtraPreset = true;
        var wlpreset = options.wlpreset;
        var presets = {};
        presets[wlpreset.name] = {
          wl: [new dwv.WindowCenterAndWidth(wlpreset.center, wlpreset.width)],
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
  dwvApp.addEventListener('loaderror', function (event) {
    console.error(event.error);
    ++nReceivedLoadError;
  });
  dwvApp.addEventListener('loadabort', function (/*event*/) {
    ++nReceivedLoadAbort;
  });
  dwvApp.addEventListener('loadend', function (/*event*/) {
    // show alert for errors
    if (nReceivedLoadError) {
      var message = 'A load error has ';
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
  var dropBoxLoader = new dwvsimple.gui.DropboxLoader(dwvApp, uid);
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
    var lg = dwvApp.getActiveLayerGroup();
    var vl = lg.getActiveViewLayer();
    var viewController = vl.getViewController();
    dwvAppGui.updatePresets(
      viewController.getWindowLevelPresetsNames()
    );
    // suppose it is a manual change so switch preset to manual
    dwvAppGui.setSelectedPreset('manual');
  });

  // load from options.urls if defined
  if (typeof options !== 'undefined' &&
    typeof options.urls !== 'undefined') {
    dwvApp.loadURLs(options.urls);
  } else {
    // possible load from location
    dwvApp.loadFromUri(window.location.href);
  }
}

// start when DOM is ready
document.addEventListener('DOMContentLoaded', function (/*event*/) {
  // update legend
  document
    .getElementById('dwvVersion')
    .appendChild(document.createTextNode(dwv.getDwvVersion()));

  // start
  startApp('simpl0');
});
