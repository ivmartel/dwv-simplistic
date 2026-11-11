
import {Gui} from './appgui.js';
import {DropboxLoader} from './lib/dropboxLoader.js';
import {DwvAppService} from './lib/dwvAppService.js';

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
 *   to release its resources.
 */
export function startApp(uid, options, rootDoc) {
  // create service
  const dwvAppService = new DwvAppService({
    uid,
    tools: options.tools,
    wlpreset: options.wlpreset,
    rootDocument: rootDoc
  });

  // gui tools
  const optionGuiTools = undefined; // available later (?)

  // app gui
  const dwvAppGui = new Gui(
    dwvAppService,
    optionGuiTools
  );
  dwvAppGui.init();

  // setup drop box
  const dropBoxLoader = new DropboxLoader(dwvAppService);
  dropBoxLoader.init();

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
