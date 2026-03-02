
import {Gui} from './appgui.js';
import {DropboxLoader} from './gui/dropboxLoader.js';
import {DwvService} from './dwv.service.js';

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
 */
export function startApp(uid, options, rootDoc) {
  // tools
  const optionGuiTools = undefined; // available later (?)

  // optional user tools
  let optionTools;
  if (typeof options.tools !== 'undefined') {
    optionTools = options.tools.split(',').map(
      (item) => item.trim().toLowerCase()
    );
  }

  // create service
  const dwvService = new DwvService({
    uid,
    tools: optionTools,
    wlpreset: options.wlpreset,
    rootDocument: rootDoc
  });

  // app gui
  const dwvAppGui = new Gui(
    dwvService,
    optionGuiTools
  );
  dwvAppGui.init();

  // setup drop box
  const dropBoxLoader = new DropboxLoader(dwvService);
  dropBoxLoader.init();

  // show/hide drop box
  let progress = 0;
  let isLoaded = false;
  const autoShowDropbox = function () {
    const isLoading = progress !== 0 && progress !== 100;
    dropBoxLoader.showDropbox(!isLoading && !isLoaded);
  };
  dwvService.addEventListener('loadprogress', function (event) {
    progress = event.detail.value;
    autoShowDropbox();
  });
  dwvService.addEventListener('dataloaded', function (event) {
    isLoaded = event.detail.value;
    autoShowDropbox();
  });

  // load from options if defined
  if (typeof options !== 'undefined') {
    if (typeof options.uri !== 'undefined') {
      dwvService.loadFromUri(options.uri);
    } else if (typeof options.urls !== 'undefined') {
      dwvService.loadURLs(options.urls);
    } else {
      dropBoxLoader.showDropbox(true);
    }
  } else {
    dropBoxLoader.showDropbox(true);
  }
};
