import {
  App,
  AppOptions,
  ViewConfig,
  ToolConfig,
  WindowLevel,
  getDwvVersion
} from 'dwv';
import {overlayConfig} from './gui/overlays.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DicomData} from 'dwv';
/* eslint-enable no-unused-vars */

/**
 * DWV service.
 */
export class DwvService extends EventTarget {
  /**
   * List of annotation shape names.
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

  #shapeNames = [];

  /**
   * List of tool names.
   *
   * @type {string[]}
   */
  #defaultToolNames = [
    'Scroll',
    'ZoomAndPan',
    'WindowLevel',
    'Draw'
  ];

  #tools;

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
   * Name of the main layer group.
   *
   * @type {string}
   */
  #layerGroupName;

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
   * @param {object} options Service options.
   */
  constructor(options) {
    super();

    if (typeof options.rootDocument === 'undefined') {
      options.rootDocument = window.document;
    }
    this.#options = options;

    this.#setupTools(options.tools);

    // initialise app
    this.#layerGroupName = 'layerGroup-' + options.uid;
    const viewConfig0 = new ViewConfig(this.#layerGroupName);
    const viewConfigs = {'*': [viewConfig0]};
    const appOptions = new AppOptions(viewConfigs);
    appOptions.tools = this.#tools;
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
   */
  #setupTools(optionTools) {
    this.#toolNames = [];
    // if input, check each validity
    if (typeof optionTools !== 'undefined') {
      for (const toolName of optionTools) {
        const found = this.#defaultToolNames.find(
          item => item.toLowerCase() === toolName.toLowerCase()
        );
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
    this.#tools = {};
    for (const toolName of this.#toolNames) {
      if (toolName === 'Draw') {
        this.#tools[toolName] = new ToolConfig(this.#defaultShapeNames);
        this.#shapeNames = this.#defaultShapeNames;
      } else {
        this.#tools[toolName] = new ToolConfig();
      }
    }
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
   * Get the layer group name.
   *
   * @returns {string} The name.
   */
  getLayerGroupName() {
    return this.#layerGroupName;
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
   * Dispatch a CustomEvent.
   *
   * @param {string} type The event type.
   * @param {object} value Teh event value.
   */
  #dispatch(type, value) {
    this.dispatchEvent(
      new CustomEvent(type, {detail: value})
    );
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

    // abort shortcut listener
    const abortOnCrtlX = function (event) {
      if (event.ctrlKey && event.keyCode === 88) {
        // crtl-x
        console.log('Abort load received from user (crtl-x).');
        this.#dwvApp.abortLoad();
      }
    };

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
      // allow to cancel via crtl-x
      window.addEventListener('keydown', abortOnCrtlX);
    });
    this.#dwvApp.addEventListener('loadprogress', (event) => {
      this.#dispatch('loadprogress', {value: event.loaded});
    });
    this.#dwvApp.addEventListener('renderend', (event) => {
      if (isFirstRender) {
        isFirstRender = false;
        const vl = this.#dwvApp.getViewLayersByDataId(event.dataid)[0];
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
      this.#metaData = structuredClone(this.#dwvApp.getMetaData(event.dataid));
      const pixelDataKey = '7FE00010';
      if (typeof this.#metaData[pixelDataKey] !== 'undefined') {
        delete this.#metaData[pixelDataKey];
      }
      // force progress
      this.#dispatch('loadprogress', {value: 100});
      // set data loaded flag
      this.#dispatch('dataloaded', {value: true});
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
      // stop listening for crtl-x
      window.removeEventListener('keydown', abortOnCrtlX);
    });
    this.#dwvApp.addEventListener('loaderror', (event) => {
      console.error(event.error);
      ++nReceivedLoadError;
    });
    this.#dwvApp.addEventListener('loadabort', (/*event*/) => {
      ++nReceivedLoadAbort;
    });
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
      if (event.value[2] === manualStr) {
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
      this.#dwvApp.defaultOnKeydown(event);
    });
    // handle window resize
    window.addEventListener('resize', this.#dwvApp.onResize);
  }

  /**
   * Setup the DWV app annotation listeners.
   */
  #setupAnnotationListeners() {
    this.#dwvApp.addEventListener('dataadd', (event) => {
      this.#dispatch('dataadd', {dataid: event.dataid});
    });
    this.#dwvApp.addEventListener('drawlayeradd', (event) => {
      this.#dispatch('drawlayeradd', {dataid: event.dataid});
    });
    this.#dwvApp.addEventListener('annotationadd', (event) => {
      this.#dispatch('annotationadd', {
        dataid: event.dataid,
        data: event.data
      });
    });
    this.#dwvApp.addEventListener('annotationupdate', (event) => {
      this.#dispatch('annotationupdate', {
        dataid: event.dataid,
        data: event.data,
        keys: event.keys
      });
    });
    this.#dwvApp.addEventListener('annotationremove', (event) => {
      this.#dispatch('annotationremove', {
        dataid: event.dataid,
        data: event.data
      });
    });

  }

  /**
   * Get data.
   *
   * @param {string} dataId The data id.
   * @returns {DicomData} The data.
   */
  getData(dataId) {
    return this.#dwvApp.getData(dataId);
  }

  /**
   * Load a list of urls.
   *
   * @param {string[]} urls The urls.
   */
  loadURLs(urls) {
    this.#dwvApp.loadURLs(urls);
  }

  /**
   * Load a from uri.
   *
   * @param {string} uri The uri.
   */
  loadFromUri(uri) {
    this.#dwvApp.loadFromUri(uri);
  }

  /**
   * Load a list of files.
   *
   * @param {File[]} files The files.
   */
  loadFiles(files) {
    this.#dwvApp.loadFiles(files);
  }

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

    const lg = this.#dwvApp.getActiveLayerGroup();
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
    const lg = this.#dwvApp.getActiveLayerGroup();
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
    const viewConfig0 = new ViewConfig(this.#layerGroupName);
    viewConfig0.orientation = this.#orientation;
    const viewConfigs = {'*': [viewConfig0]};
    this.#dwvApp.setDataViewConfigs(viewConfigs);
    // render data
    const dataIds = this.#dwvApp.getDataIds();
    for (const dataId of dataIds) {
      this.#dwvApp.render(dataId);
    }
  }

  goToAnnotation(dataId, annotationId) {
    const data = this.#dwvApp.getData(dataId);
    const annotationGroup = data.annotationGroup;
    const annotation = annotationGroup.find(annotationId);
    const annotCentroid = annotation.getCentroid();
    if (typeof annotCentroid !== 'undefined') {
      const drawLayers = this.#dwvApp.getDrawLayersByDataId(dataId);
      for (const layer of drawLayers) {
        layer.setCurrentPosition(annotCentroid);
      }
    } else {
      console.log('No centroid for annotation');
    }
  }

  setAnnotationVisibility(dataId, annotationId, flag) {
    const drawLayers = this.#dwvApp.getDrawLayersByDataId(dataId);
    for (const layer of drawLayers) {
      layer.setAnnotationVisibility(annotationId, flag);
    }
  }

  setAnnotationLabelsVisibility(dataId, flag) {
    const drawLayer = this.#dwvApp.getDrawLayersByDataId(dataId)[0];
    if (typeof drawLayer === 'undefined') {
      console.warn('Cannot find draw layer with id ' + dataId);
    }
    drawLayer.setLabelsVisibility(flag);
  }

  addAnnotationGroup() {
    //const divId = 'layerGroup0';
    const divId = this.#layerGroupName;
    const layerGroup = this.#dwvApp.getLayerGroupByDivId(divId);
    // add annotation group
    const viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      console.warn(
        'No active view layer, please select one in the data table'
      );
      return;
    }
    const refDataId = viewLayer.getDataId();
    const data = this.#dwvApp.createAnnotationData(refDataId);
    // render (will create draw layer)
    this.#dwvApp.addAndRenderAnnotationData(data, divId, refDataId);

  }

  /**
   * Add to undo stack.
   */
  addToUndoStack = () => {
    this.#dwvApp.addToUndoStack();
  };

  /**
   * Reset the layout.
   */
  reset() {
    this.#dwvApp.resetZoomPan();
  }

  onResize() {
    this.#dwvApp.onResize();
  }
}
