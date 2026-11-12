
import {Gui, getDwvDivId} from './appgui.js';
import {DropboxLoader} from './lib/dropboxLoader.js';
import {DwvAppService} from './lib/dwvAppService.js';
import {AnnotationService} from './lib/annotationService.js';
import {showSnackbar} from './lib/snackbar.js';

/**
 * Application launcher.
 *
 * @param {string} uid The app uid.
 * @param {object} options Start options:
 * - uri (string): an URI with search parameters,
 * - urls (string[]): list of urls to load,
 * - wlpreset ({name, center, width}): default window level preset,
 * - tools (string[]): list of tools.
 * @param {Document} [rootDoc] Optional root document,
 *   defaults to `window.document`.
 * @returns {DwvAppService} The created service, call its `dispose` method
 *   to release its resources (and the ones of the dependent services).
 */
export function startApp(uid, options, rootDoc) {
  // create service
  const dwvAppService = new DwvAppService({
    uid,
    tools: options.tools,
    wlpreset: options.wlpreset,
    rootDocument: rootDoc
  });

  // create annotation service
  const annotService = new AnnotationService(dwvAppService);
  annotService.connect();
  dwvAppService.addEventListener('dispose', function () {
    annotService.dispose();
  });

  // gui tools
  const optionGuiTools = undefined; // available later (?)

  // app gui
  const dwvAppGui = new Gui(
    dwvAppService,
    annotService,
    optionGuiTools
  );
  dwvAppGui.init();

  // setup drop box
  const dropBoxLoader = new DropboxLoader(dwvAppService);
  dropBoxLoader.init();

  // show messages in a snackbar
  const showMessage = function (message) {
    const container = dwvAppService.getOptions().rootDocument
      .getElementById(getDwvDivId(uid));
    if (container) {
      showSnackbar(container, message);
    }
  };
  const onError = function (event) {
    showMessage(event.detail.error.message);
  };
  dwvAppService.addEventListener('error', onError);
  dwvAppService.addEventListener('loadabort', function (event) {
    showMessage(event.detail.message);
  });
  annotService.addEventListener('error', onError);

  // show/hide drop box
  let progress = 0;
  let isLoaded = false;
  const autoShowDropbox = function () {
    const isLoading = progress !== 0 && progress !== 100;
    dropBoxLoader.showDropbox(!isLoading && !isLoaded);
  };
  dwvAppService.addEventListener('loadprogress', function (event) {
    progress = event.detail.value;
    autoShowDropbox();
  });
  dwvAppService.addEventListener('dataloaded', function (event) {
    isLoaded = event.detail.value;
    autoShowDropbox();
  });

  // load from options if defined
  if (typeof options !== 'undefined') {
    if (typeof options.uri !== 'undefined') {
      dwvAppService.loadFromUri(options.uri);
    } else if (typeof options.urls !== 'undefined') {
      dwvAppService.loadURLs(options.urls);
    } else {
      dropBoxLoader.showDropbox(true);
    }
  } else {
    dropBoxLoader.showDropbox(true);
  }

  return dwvAppService;
};
