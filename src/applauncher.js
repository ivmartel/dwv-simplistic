/**
 * Application launcher.
 */
// main application (global to be accessed from html)
var dwvApp = new dwv.App();

// start app function
function startApp() {
    // translate page
    dwv.i18nPage();

    // update legend
    document.getElementById('legend').innerHTML = "Powered by dwv "+dwv.getVersion();
    // initialise the application
    dwvApp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Scroll", "ZoomAndPan", "WindowLevel"],
        "isMobile": true
    });
    // activate tools on load end
    dwvApp.addEventListener('load-end', function (/*event*/) {
        document.getElementById('tools').disabled = false;
        document.getElementById('reset').disabled = false;
    });
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
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

// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise("auto", "node_modules/dwv");

// DOM ready?
document.addEventListener("DOMContentLoaded", function (/*event*/) {
    domContentLoaded = true;
    launchApp();
});
