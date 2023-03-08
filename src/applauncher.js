// namespace
var dwvsimple = dwvsimple || {};

/**
 * Application launcher.
 */

// main application gui (global to be accessed from html)
var dwvAppGui = null;

// start app function
function startApp() {
  // update legend
  document
    .getElementById('dwvVersion')
    .appendChild(document.createTextNode(dwv.getVersion()));

  // options
  var options = {
    dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
    tools: {
      Scroll: {},
      ZoomAndPan: {},
      WindowLevel: {}
    }
  };
  // main application
  var dwvApp = new dwv.App();
  dwvApp.init(options);

  // app gui
  dwvAppGui = new dwvsimple.Gui(dwvApp);

  // setup the dropbox loader
  var dropBoxLoader = new dwvsimple.gui.DropboxLoader(dwvApp);
  dropBoxLoader.init();

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
    // hide drop box
    dropBoxLoader.showDropbox(false);
    // allow to cancel via crtl-x
    window.addEventListener('keydown', abortOnCrtlX);
  });
  dwvApp.addEventListener('loaditem', function (/*event*/) {
    ++nLoadItem;
  });
  dwvApp.addEventListener('renderend', function (/*event*/) {
    if (isFirstRender) {
      isFirstRender = false;
      // activate tools
      document.getElementById('tools').disabled = false;
      document.getElementById('reset').disabled = false;
      document.getElementById('presets').disabled = false;
      // set the selected tool
      var selectedTool = 'ZoomAndPan';
      if (dwvApp.canScroll()) {
        selectedTool = 'Scroll';
      }
      dwvApp.setTool(selectedTool);
      // update presets
      var lg = dwvApp.getActiveLayerGroup();
      var vl = lg.getActiveViewLayer();
      var viewController = vl.getViewController();
      dwvAppGui.updatePresets(
        viewController.getWindowLevelPresetsNames()
      );
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
      // show the drop box if no item were received
      if (!nLoadItem) {
        dropBoxLoader.showDropbox(true);
      }
    }
    // console warn for aborts
    if (nReceivedLoadAbort !== 0) {
      console.warn('Data load was aborted.');
      dropBoxLoader.showDropbox(true);
    }
    // stop listening for crtl-x
    window.removeEventListener('keydown', abortOnCrtlX);
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

  // possible load from location
  dwv.utils.loadFromUri(window.location.href, dwvApp);
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: 'node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'node_modules/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  rle: 'node_modules/dwv/decoders/dwv/decode-rle.js'
};

// check environment support
dwv.env.check();

// DOM ready?
document.addEventListener('DOMContentLoaded', function (/*event*/) {
  startApp();
});
