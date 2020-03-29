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

    // options
    var options = {
        "containerDivId": "dwv",
        "tools": {
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
        if (event.ctrlKey && event.keyCode === 88 ) { // crtl-x
            console.log("Abort load received from user (crtl-x).");
            dwvApp.abortLoad();
        }
    };

    // handle load events
    var nReceivedLoadItem = null;
    var nReceivedError = null;
    var nReceivedAbort = null;
    dwvApp.addEventListener('load-start', function (/*event*/) {
        // reset counts
        nReceivedLoadItem = 0;
        nReceivedError = 0;
        nReceivedAbort = 0;
        // allow to cancel via crtl-x
        window.addEventListener("keydown", abortOnCrtlX);
    });
    dwvApp.addEventListener('load-item', function (/*event*/) {
        ++nReceivedLoadItem;
    });
    dwvApp.addEventListener('load-item', function (/*event*/) {
        // hide drop box (for url load)
        dropBoxLoader.hideDropboxElement();
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
    });
    dwvApp.addEventListener('error', function (event) {
        console.error(event.error);
        ++nReceivedError;
    });
    dwvApp.addEventListener('abort', function (/*event*/) {
        ++nReceivedAbort;
    });
    dwvApp.addEventListener('load-end', function (/*event*/) {
        // show the drop box if no item were received
        if (nReceivedLoadItem === 0) {
            dropBoxLoader.showDropboxElement();
        }
        // show alert for errors
        if (nReceivedError !== 0) {
            var message = "A load error has ";
            if (nReceivedError > 1) {
                message = nReceivedError + " load errors have ";
            }
            message += "occured. See log for details.";
            alert(message);
        }
        // console warn for aborts
        if (nReceivedAbort !== 0) {
            console.warn("Data load was aborted.");
        }
        // stop listening for crtl-x
        window.removeEventListener("keydown", abortOnCrtlX);

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
