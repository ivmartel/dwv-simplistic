import {
  App,
  AppOptions,
  ViewConfig,
  ToolConfig,
  WindowLevel,
  getDwvVersion,
  getURLsFromKeyValueUri,
  handleURLsFromWeasisXMLManifest
} from 'dwv';
import {overlayConfig} from './gui/overlays.js';

/**
 * @import {
 *   DataController,
 *   DicomData,
 *   StageController,
 *   UndoController
 * } from 'dwv';
 */

const _LOAD_TIMERS = false;

/**
 * DWV service.
 */
export class DwvService extends EventTarget {
  /**
   * List of default annotation shape names.
   *
   * @type {string[]}
   */
  #defaultShapeNames = [
    'Ruler',
    'Arrow',
    'Rectangle',
    'Circle',
    'Ellipse',
    'Protractor',
    'Roi'
  ];

  /**
   * List of annotation shape names.
   *
   * @type {string[]}
   */
  #shapeNames = [];

  /**
   * List of default tool names.
   *
   * @type {string[]}
   */
  #defaultToolNames = [
    'Scroll',
    'ZoomAndPan',
    'WindowLevel',
    'Draw'
  ];

  /**
   * List of tool names.
   *
   * @type {string[]}
   */
  #toolNames;

  /**
   * Can scroll flag.
   *
   * @type {boolean}
   */
  #canScroll = false;
  /**
   * Can window level flag.
   *
   * @type {boolean}
   */
  #canWindowLevel = false;

  /**
   * Orientation name.
   *
   * @type {string}
   */
  #orientation;

  /**
   * Div id of the main layer group.
   *
   * @type {string}
   */
  #layerGroupDivId;

  /**
   * DWV app.
   *
   * @type {App}
   */
  #dwvApp = new App();

  /**
   * Meta data of the loaded data.
   *
   * @type {object}
   */
  #metaData;

  /**
   * List of preset names: set after first render.
   *
   * @type {string[]}
   */
  #presetNames;

  /**
   * Input options.
   *
   * @type {object}
   */
  #options;

  /**
   * Abort the current loads on ctrl-x.
   *
   * @param {KeyboardEvent} event The key event.
   */
  #onAbortKeydown = (event) => {
    if (event.ctrlKey && event.keyCode === 88) {
      // crtl-x
      console.log('Abort load received from user (crtl-x).');
      this.#dwvApp.abortAllLoads();
    }
  };

  /**
   * @param {object} options Service options.
   */
  constructor(options) {
    super();

    if (typeof options.rootDocument === 'undefined') {
      options.rootDocument = window.document;
    }
    this.#options = options;

    const tools = this.#setupTools(options.tools);

    // view config
    // Note: assuming only one layer group
    this.#layerGroupDivId = 'layerGroup-' + options.uid;
    const viewConfig0 = new ViewConfig(this.#layerGroupDivId);
    const viewConfigs = {'*': [viewConfig0]};

    // initialise app
    const appOptions = new AppOptions(viewConfigs);
    appOptions.tools = tools;
    appOptions.overlayConfig = overlayConfig;
    appOptions.rootDocument = options.rootDocument;
    this.#dwvApp.init(appOptions);

    // setup listeners
    this.#setupLoadListeners();
    this.#setupListeners();
    this.#setupAnnotationListeners();
  }

  /**
   * Setup the list of tools.
   *
   * @param {string[]} optionTools Option tools.
   * @returns {ToolConfig[]} The final list of tools.
   */
  #setupTools(optionTools) {
    this.#toolNames = [];
    // if input, check each validity
    if (typeof optionTools !== 'undefined') {
      for (const toolName of optionTools) {
        const found = this.#defaultToolNames.find(
          item => item.toLowerCase() === toolName.toLowerCase()
        );
        // use name from default list
        if (typeof found !== 'undefined') {
          this.#toolNames.push(found);
        } else {
          console.warn('Unknown tool', toolName);
        }
      }
    }
    // no option or none found
    if (this.#toolNames.length === 0) {
      this.#toolNames = this.#defaultToolNames;
    }

    // convert to tools
    const tools = {};
    for (const toolName of this.#toolNames) {
      if (toolName === 'Draw') {
        tools[toolName] = new ToolConfig(this.#defaultShapeNames);
        this.#shapeNames = this.#defaultShapeNames;
      } else {
        tools[toolName] = new ToolConfig();
      }
    }
    return tools;
  }

  /**
   * Dispatch a CustomEvent.
   *
   * @param {string} type The event type.
   * @param {object} value The event value.
   */
  #dispatch(type, value) {
    this.dispatchEvent(
      new CustomEvent(type, {detail: value})
    );
  }

  /**
   * Ge the input options.
   *
   * @returns {object} The options.
   */
  getOptions() {
    return this.#options;
  }

  /**
   * Get the layer group div id.
   *
   * @returns {string} The div id.
   */
  getMainLayerGroupDivId() {
    return this.#layerGroupDivId;
  }

  /**
   * Get the DWV version.
   *
   * @returns {string} The version.
   */
  getDwvVersion() {
    return getDwvVersion();
  }

  /**
   * Get the list of tool names.
   *
   * @returns {string[]} The list of names.
   */
  getToolNames() {
    return this.#toolNames;
  }

  /**
   * Get the list of annotation shape names.
   *
   * @returns {string[]} The list of names.
   */
  getShapeNames() {
    return this.#shapeNames;
  }

  /**
   * Get the meta data of the loaded data.
   *
   * @returns {object} The meta data.
   */
  getMetaData() {
    return this.#metaData;
  }

  /**
   * Get the option window level preset if present.
   *
   * @returns {string|undefined} The preset name.
   */
  getOptionWlPresetName() {
    let res;
    if (typeof this.#options.wlpreset !== 'undefined') {
      res = this.#options.wlpreset.name;
    }
    return res;
  }

  /**
   * List of preset names: set after first render.
   *
   * @param {string[]} value The names.
   */
  #setPresetNames(value) {
    this.#presetNames = value;
    this.#dispatch('presetnames', {value});
  }

  /**
   * Setup the DWV app load listeners.
   */
  #setupLoadListeners() {
    // handle load events
    let nReceivedLoadError = 0;
    let nReceivedLoadAbort = 0;
    let isFirstRender = false;
    this.#dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.#dispatch('dataready', {value: false});
      this.#dispatch('dataloaded', {value: false});
      nReceivedLoadError = 0;
      nReceivedLoadAbort = 0;
      isFirstRender = true;
    });
    this.#dwvApp.addEventListener('loadprogress', (event) => {
      this.#dispatch('loadprogress', {value: event.detail.loaded});
    });
    this.#dwvApp.addEventListener('renderend', (event) => {
      if (isFirstRender) {
        isFirstRender = false;
        const vl = this.#dwvApp.getStageController()
          .getViewLayersByDataId(event.detail.dataid)[0];
        const vc = vl.getViewController();
        // option preset
        if (typeof this.#options.wlpreset !== 'undefined') {
          const presets = {};
          presets[this.#options.wlpreset.name] = {
            wl: [new WindowLevel(
              this.#options.wlpreset.center,
              this.#options.wlpreset.width
            )],
            name: this.#options.wlpreset.name
          };
          vc.addWindowLevelPresets(presets);
        }
        // available tools
        this.#canScroll = vc.canScroll();
        this.#canWindowLevel = vc.isMonochrome();
        // get window level presets
        this.#setPresetNames(vc.getWindowLevelPresetsNames());
        // select optional preset
        if (typeof this.#options.wlpreset !== 'undefined') {
          vc.setWindowLevelPreset(this.#options.wlpreset.name);
        }
        // set data ready flag
        this.#dispatch('dataready', {value: true});
      }
    });
    this.#dwvApp.addEventListener('load', (event) => {
      // set dicom tags
      const data = this.#dwvApp.getDataController().get(event.detail.dataid);
      this.#metaData = structuredClone(data.meta);
      const pixelDataKey = '7FE00010';
      if (typeof this.#metaData[pixelDataKey] !== 'undefined') {
        delete this.#metaData[pixelDataKey];
      }
      // force progress
      this.#dispatch('loadprogress', {value: 100});
      // set data loaded flag
      this.#dispatch('dataloaded', {value: true});
    });

    // abort shortcut
    this.#dwvApp.addEventListener('loadstart', (/*event*/) => {
      window.addEventListener('keydown', this.#onAbortKeydown);
    });
    this.#dwvApp.addEventListener('loadend', (/*event*/) => {
      window.removeEventListener('keydown', this.#onAbortKeydown);
    });

    // warn/error
    this.#dwvApp.addEventListener('loaditem', function (event) {
      if (typeof event.detail.warn !== 'undefined') {
        console.warn('load-warn', event.detail.warn);
      }
    });
    this.#dwvApp.addEventListener('error', (event) => {
      console.error(event.detail.error);
      ++nReceivedLoadError;
    });
    this.#dwvApp.addEventListener('abort', (/*event*/) => {
      ++nReceivedLoadAbort;
    });
    this.#dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedLoadError) {
        this.#dispatch('loadprogress', {value: 0});
        alert('Received errors during load. Check log for details.');
      }
      if (nReceivedLoadAbort) {
        this.#dispatch('loadprogress', {value: 0});
        alert('Load was aborted.');
      }
    });

    // timers
    if (_LOAD_TIMERS) {
      // loading
      this.#dwvApp.addEventListener('loadstart', function (event) {
        console.time('load-data-' + event.detail.dataid);
      });
      this.#dwvApp.addEventListener('loadend', function (event) {
        console.timeEnd('load-data-' + event.detail.dataid);
      });
      // labeling
      this.#dwvApp.addEventListener('labelingstart', function (event) {
        console.time('label-data-' + event.detail.dataid);
      });
      this.#dwvApp.addEventListener('labelschanged', function (event) {
        console.timeEnd('label-data-' + event.detail.dataid);
      });
      // resampling
      this.#dwvApp.addEventListener('imageresamplingstart',
        function (event) {
          console.time('resample-data-' + event.detail.dataid);
        }
      );
      this.#dwvApp.addEventListener('imageresamplingcomplete',
        function (event) {
          console.timeEnd('resample-data-' + event.detail.dataid);
        }
      );
    }
  }

  /**
   * Setup the DWV app generic listeners.
   */
  #setupListeners() {
    // listen to 'wlchange' to flag a manual change
    // and update the presets if necessary
    this.#dwvApp.addEventListener('wlchange', (event) => {
      // value: [center, width, name]
      const manualStr = 'manual';
      if (event.detail.value[2] === manualStr) {
        if (!this.#presetNames.includes(manualStr)) {
          this.#setPresetNames([...this.#presetNames, manualStr]);
        }
        this.#dispatch('ismanualpreset', {value: true});
      } else {
        this.#dispatch('ismanualpreset', {value: false});
      }
    });

    // handle key events
    this.#dwvApp.addEventListener('keydown', (event) => {
      this.#dwvApp.defaultOnKeydown(event.detail);
    });
    // handle window resize
    window.addEventListener('resize', this.#dwvApp.onResize);
  }

  /**
   * Setup the DWV app annotation listeners.
   */
  #setupAnnotationListeners() {
    this.#dwvApp.addEventListener('dataadd', (event) => {
      this.#dispatch('dataadd', {dataid: event.detail.dataid});
    });
    this.#dwvApp.addEventListener('dataremove', (event) => {
      this.#dispatch('dataremove', {dataid: event.detail.dataid});
    });
    this.#dwvApp.addEventListener('drawlayeradd', (event) => {
      this.#dispatch('drawlayeradd', {dataid: event.detail.dataid});
    });
    this.#dwvApp.addEventListener('annotationadd', (event) => {
      this.#dispatch('annotationadd', {
        dataid: event.detail.dataid,
        data: event.detail.data
      });
    });
    this.#dwvApp.addEventListener('annotationupdate', (event) => {
      this.#dispatch('annotationupdate', {
        dataid: event.detail.dataid,
        data: event.detail.data,
        keys: event.detail.keys
      });
    });
    this.#dwvApp.addEventListener('annotationremove', (event) => {
      this.#dispatch('annotationremove', {
        dataid: event.detail.dataid,
        data: event.detail.data
      });
    });
  }

  // Load related [start] ------------------------------------------------

  /**
   * Load a list of urls.
   *
   * @param {string[]} urls The urls.
   */
  loadURLs(urls) {
    this.#dwvApp.loadURLs(urls);
  }

  /**
   * Load from a uri: either key-value pairs as in
   * `?input=[url-encoded uri with key-value pairs]`
   * or a Weasis XML manifest as in `?input=[manifest url]&type=manifest`.
   *
   * @param {string} uri The uri.
   */
  loadFromUri(uri) {
    const url = new URL(uri, window.location.href);
    if (url.searchParams.get('type') === 'manifest') {
      handleURLsFromWeasisXMLManifest(uri, (urls) => {
        this.loadURLs(urls);
      });
    } else {
      const urls = getURLsFromKeyValueUri(uri);
      if (typeof urls !== 'undefined') {
        this.loadURLs(urls);
      }
    }
  }

  /**
   * Load a list of files.
   *
   * @param {File[]} files The files.
   */
  loadFiles(files) {
    this.#dwvApp.loadFiles(files);
  }

  // Load related [end] ------------------------------------------------

  // Tool related [start] ------------------------------------------------

  /**
   * Check if a tool can be run.
   *
   * @param {string} toolName The tool name.
   * @returns {boolean|undefined} True if the tool can be run,
   *   undefined if unknown.
   */
  canRunTool(toolName) {
    let res;
    if (toolName === 'Scroll') {
      res = this.#canScroll;
    } else if (toolName === 'WindowLevel') {
      res = this.#canWindowLevel;
    } else if (this.#toolNames.includes(toolName)) {
      res = true;
    } else {
      console.log('Unknwon tool', toolName);
    }
    return res;
  }

  /**
   * Get the first runnable tool name from the list of tools.
   *
   * @returns {string} The tool name.
   */
  getFirstRunnableTool() {
    return this.#toolNames.find((item) => this.canRunTool(item));
  }

  /**
   * Apply a tool: set it to dwv.
   *
   * @param {string} toolName The tool name.
   * @param {object} features Optional tool features.
   */
  applyTool(toolName, features) {
    this.#dwvApp.setTool(toolName);
    if (features !== undefined) {
      this.#dwvApp.setToolFeatures(features);
    }

    const lg = this.#dwvApp.getStageController().getActiveLayerGroup();
    if (toolName === 'Draw') {
      // reuse created draw layer
      if (lg !== undefined && lg.getNumberOfLayers() > 1) {
        lg?.setActiveLayer(1);
      }
    } else {
      // if draw was created, active is now a draw layer...
      // reset to view layer
      lg?.setActiveLayer(0);
    }
  }

  /**
   * Apply a window level preset: set it to dwv.
   *
   * @param {string} presetName The preset name.
   */
  applyPreset(presetName) {
    const lg = this.#dwvApp.getStageController().getActiveLayerGroup();
    if (lg !== undefined) {
      const vl = lg.getViewLayersFromActive()[0];
      const vc = vl.getViewController();
      vc.setWindowLevelPreset(presetName);
    }
  }

  /**
   * Toogle between possible orientations.
   */
  toggleOrientation() {
    if (typeof this.#orientation !== 'undefined') {
      if (this.#orientation === 'axial') {
        this.#orientation = 'coronal';
      } else if (this.#orientation === 'coronal') {
        this.#orientation = 'sagittal';
      } else if (this.#orientation === 'sagittal') {
        this.#orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.#orientation = 'coronal';
    }
    // update data view config
    const viewConfig0 = new ViewConfig(this.#layerGroupDivId);
    viewConfig0.orientation = this.#orientation;
    const viewConfigs = {'*': [viewConfig0]};
    const stageController = this.#dwvApp.getStageController();
    stageController.setDataViewConfigs(viewConfigs);
    // render data
    const dataIds = this.#dwvApp.getDataController().getDataIds();
    for (const dataId of dataIds) {
      stageController.render(dataId);
    }
  }

  /**
   * Reset the layout.
   */
  reset() {
    this.#dwvApp.getStageController().resetZoomPan();
  }

  /**
   * Release the resources held by the service: abort the current loads,
   * remove the window listeners and reset the dwv app.
   * The service should not be used afterwards.
   */
  dispose() {
    window.removeEventListener('resize', this.#dwvApp.onResize);
    window.removeEventListener('keydown', this.#onAbortKeydown);
    this.#dwvApp.abortAllLoads();
    this.#dwvApp.reset();
  }

  /**
   * Handle a resize.
   */
  onResize() {
    this.#dwvApp.onResize();
  }

  // Tool related [end] ------------------------------------------------

  // Annotation related [start] ------------------------------------------------

  /**
   * Get the data controller.
   *
   * @returns {DataController} The controller.
   */
  getDataController() {
    return this.#dwvApp.getDataController();
  }

  /**
   * Get the stage controller.
   *
   * @returns {StageController} The controller.
   */
  getStageController() {
    return this.#dwvApp.getStageController();
  }

  /**
   * Get the undo controller.
   *
   * @returns {UndoController} The controller.
   */
  getUndoController() {
    return this.#dwvApp.getUndoController();
  }

  /**
   * Create new annotation data.
   *
   * @param {string} refDataId The reference data id.
   * @returns {DicomData} The new data.
   */
  createAnnotationData(refDataId) {
    return this.#dwvApp.createAnnotationData(refDataId);
  }

  /**
   * Add and render annotation data.
   *
   * @param {DicomData} data The data to add.
   * @param {string} divId The div where to draw.
   * @param {string} refDataId The reference data id.
   */
  addAndRenderAnnotationData(data, divId, refDataId) {
    this.#dwvApp.addAndRenderAnnotationData(data, divId, refDataId);
  }

  // Annotation related [end] ------------------------------------------------

}
