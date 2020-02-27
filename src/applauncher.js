// namespace
var dwvsimple = dwvsimple || {};

/**
 * Application launcher.
 */

// main application gui (global to be accessed from html)
var dwvAppGui = null;

// start app function
function startApp() {
    // translate page
    dwv.i18nPage();

    // update legend
    document.getElementById('dwvVersion').appendChild(
      document.createTextNode(dwv.getVersion()));

    // initialise the application
    var dwvApp = new dwv.App();
    dwvApp.init({
        "containerDivId": "dwv",
        "tools": {
            Scroll: {},
            ZoomAndPan: {},
            WindowLevel: {}
        }
    });

    // app gui
    dwvAppGui = new dwvsimple.Gui(dwvApp);

    // setup the dropbox loader
    var dropBoxLoader = new dwvsimple.gui.DropboxLoader(dwvApp);
    dropBoxLoader.init();

    // handle load events
    var nReceivedError = null;
    var nReceivedAbort = null;
    dwvApp.addEventListener('load-start', function (/*event*/) {
        nReceivedError = 0;
        nReceivedAbort = 0;
    });
    dwvApp.addEventListener('load', function (/*event*/) {
        // activate tools
        document.getElementById('tools').disabled = false;
        document.getElementById('reset').disabled = false;
        document.getElementById('presets').disabled = false;
        // update presets
        dwvAppGui.updatePresets(dwvApp.getViewController().getWindowLevelPresetsNames());
        // set the selected tool
        var selectedTool = 'Scroll';
        if (dwvApp.isMonoSliceData() &&
            dwvApp.getImage().getNumberOfFrames() === 1) {
            selectedTool = 'ZoomAndPan';
        }
        dwvApp.setTool(selectedTool);
        // hide drop box (for url load)
        dropBoxLoader.hideDropboxElement();
    });
    dwvApp.addEventListener('load-end', function (/*event*/) {
        if (nReceivedError) {
            alert('Received errors during load. Check log for details.');
        }
        if (nReceivedAbort) {
            alert('Load was aborted.');
        }
    });
    dwvApp.addEventListener('error', function (event) {
        console.error(event.error);
        ++nReceivedError;
    });
    dwvApp.addEventListener('abort', function (/*event*/) {
        ++nReceivedAbort;
    });

    // handle key events
    dwvApp.addEventListener('keydown', function (event) {
        dwvApp.defaultOnKeydown(event);
    });
    // handle window resize
    window.addEventListener('resize', dwvApp.onResize);

    // listen to 'wl-center-change'
    dwvApp.addEventListener('wl-center-change', function (/*event*/) {
        // update presets (in case new was added)
        dwvAppGui.updatePresets(dwvApp.getViewController().getWindowLevelPresetsNames());
        // suppose it is a manual change so switch preset to manual
        dwvAppGui.setSelectedPreset("manual");
    });

    // possible load from location
    dwv.utils.loadFromUri(window.location.href, dwvApp);
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js",
    "rle": "node_modules/dwv/decoders/dwv/decode-rle.js"
};

// status flags
var domContentLoaded = false;
var i18nInitialised = false;
// launch when both DOM and i18n are ready
function launchApp() {
    if ( domContentLoaded && i18nInitialised ) {
        startApp();
    }
}
// i18n ready?
dwv.i18nOnInitialised( function () {
    i18nInitialised = true;
    launchApp();
});

// check environment support
dwv.env.check();
// initialise i18n
dwv.i18nInitialise("auto", "node_modules/dwv");

// DOM ready?
document.addEventListener("DOMContentLoaded", function (/*event*/) {
    domContentLoaded = true;
    launchApp();
});
