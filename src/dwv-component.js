import {getDwvVersion} from 'dwv';
import {startApp} from './applauncher';

import styles from './dwv-component.css';

/**
 * DWV component: display DICOM data using DWV (DICOM Web Viewer).
 * Possible arguments are:
 * - uri: an input string URI to load the data from,
 * - urls: comma separated list of urls to load the data from,
 * - showLegend: (optional) show or not the legend (defaults to false),
 * - wlpresetname, wlpresetcenter and wlpresetwidth: (optional) used
 *   to start the viewer with a specific window level setting
 *   (only applied if all three values are present).
 *
 * A dropbox is shown if no uri nor urls are provided, it allows to
 * manually load dicom data from the local system.
 *
 * Ref: {@link https://github.com/ivmartel/dwv}.
 *
 * @example
 * <dwv-simple showLegend="true"></dwv-simple>
 * @example
 * <dwv-simple
 *   uri="https://www.demo.com/index.html?input=file.dcm"
 * ></dwv-simple>
 * @example
 * <dwv-simple
 *   urls="
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm,
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm
 *   "
 * ></dwv-simple>
 * @example
 * <dwv-simple
 *   urls="
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm,
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm
 *   "
 *   wlpresetname="preset0"
 *   wlpresetcenter="0"
 *   wlpresetwidth="2500"
 * ></dwv-simple>
 */
export class DwvComponent extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  connectedCallback() {
    const appId = 'simple0';

    // main container
    const container = document.createElement('div');
    container.id = 'dwv-' + appId;
    container.className = 'dwv';

    // toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar-' + appId;
    toolbar.className = 'toolbar';

    // layer group
    const layerGroup = document.createElement('div');
    layerGroup.id = 'layerGroup-' + appId;
    layerGroup.className = 'layerGroup';
    const dropBox = document.createElement('div');
    dropBox.id = 'dropBox';
    layerGroup.appendChild(dropBox);

    // fill container
    container.appendChild(toolbar);
    container.appendChild(layerGroup);

    // legend
    if (this.hasAttribute('showLegend') &&
      this.getAttribute('showLegend') === 'true') {
      const dwvLink = document.createElement('a');
      dwvLink.href = 'https://github.com/ivmartel/dwv';
      dwvLink.title = 'dwv on github';
      dwvLink.appendChild(document.createTextNode('dwv'));

      const para = document.createElement('p');
      para.appendChild(document.createTextNode('Powered by '));
      para.appendChild(dwvLink);
      para.appendChild(document.createTextNode(
        ' ' + getDwvVersion() + '.'));

      const legend = document.createElement('div');
      legend.id = 'legend-' + appId;
      legend.className = 'legend';
      legend.appendChild(para);

      container.appendChild(legend);
    }

    // style
    const stylesheet = document.createElement('style');
    stylesheet.innerHTML = styles.toString();

    // shadow root
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(stylesheet);
    shadow.appendChild(container);

    // create options from attributes
    const options = {};
    if (this.hasAttribute('uri')) {
      options.uri = this.getAttribute('uri');
    } else if (this.hasAttribute('urls')) {
      const trimItem = function (item) {
        return item.trim();
      };
      options.urls = this.getAttribute('urls').split(',').map(trimItem);
    }
    if (this.hasAttribute('wlpresetname') &&
      this.hasAttribute('wlpresetcenter') &&
      this.hasAttribute('wlpresetwidth')) {
      options.wlpreset = {
        name: this.getAttribute('wlpresetname'),
        center: this.getAttribute('wlpresetcenter'),
        width: this.getAttribute('wlpresetwidth')
      };
    }

    // start app
    startApp(appId, options, shadow);
  }

}

// Define the new element
customElements.define('dwv-simple', DwvComponent);
