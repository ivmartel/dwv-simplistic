import {getDwvVersion} from 'dwv';
import {startApp} from './applauncher.js';
import {getDropboxElement} from './gui/dropboxLoader.js';
import {getRightPanelElements} from './gui/rightPanel.js';
import {getModalElement} from './gui/modal.js';

import styles from './dwv-component.css';
import themeCommon from './theme/common.css';
import themeDark from './theme/dark.css';
import themeLight from './theme/light.css';
import themeBlue from './theme/blue.css';

/**
 * DWV component: display DICOM data using DWV (DICOM Web Viewer).
 * Possible attributes are:
 * - uri: an input string URI to load the data from,
 * - urls: comma separated list of urls to load the data from,
 * - loadfromwindowlocation: (boolean) use the window location
 *   as input uri if it contains search arguments,
 * - showlegend: (boolean) show or not the legend (defaults to false),
 * - wlpresetname, wlpresetcenter and wlpresetwidth: start
 *   the viewer with a specific window level setting instead of the one
 *   present in the DICOM file (only applied if all three values are present),
 * - height: the css height of the component,
 * - width: the css width of the component,
 * - tools: comma separeted list of viewer tools, available are: 'Scroll',
 *   'ZoomAndPan', 'WindowLevel' and 'Draw' (case insensitive).
 * - theme: one or two theme names (space separated), if two are provided, the first
 *   one will be used as light theme and the second one as dark. Available: 'light',
 *   'dark' and 'blue', defaults to 'light dark'.
 *
 * Attributes are case insensitive. Boolean type are considered true if
 * present whatever the value.
 *
 * A dropbox is shown if no uri nor urls are provided. It allows to
 * manually load dicom data from the local system.
 *
 * The inner div structure is:
 * <div class='dwv'>
 *   <div class='header'></div>
 *   <div class='content'>
 *     <div class='layerGroup'></div>
 *   </div>
 *   <div class='footer'></div>
 * </div>
 * Each div css is overridable via `dwv-simple::part(dwv)` (replace `dwv`
 * by the desired div class name).
 *
 * Ref:
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components},
 * - {@link https://github.com/ivmartel/dwv}.
 *
 * @example
 * <dwv-simple></dwv-simple>
 * @example
 * <dwv-simple showlegend loadfromwindowlocation></dwv-simple>
 * @example
 * <dwv-simple showlegend loadfromwindowlocation theme="blue"></dwv-simple>
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
 * @example
 * <dwv-simple
 *   urls="
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm,
 *     https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm
 *   "
 *   tools="scroll, windowlevel"
 * ></dwv-simple>
 */
export class DwvComponent extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  /**
   * Invoked when the custom element is first connected to the document's DOM.
   */
  connectedCallback() {
    // use element id as appId if present or
    // generate random
    let appId;
    if (this.hasAttribute('id')) {
      appId = this.getAttribute('id');
    } else {
      appId = window.crypto.randomUUID().substring(0, 8);
    }

    // main container
    const container = document.createElement('div');
    container.id = 'dwv-' + appId;
    container.className = 'dwv';
    container.part = 'dwv';

    // fill container
    container.appendChild(this.#getHeader(appId));
    container.appendChild(this.#getContent(appId));
    if (this.hasAttribute('showlegend')) {
      container.appendChild(this.#getFooter(appId));
    }
    container.appendChild(this.#getExtra(appId));

    // extra css for height and width
    let extraCss = '';
    if (this.hasAttribute('height')) {
      extraCss += 'height: ' + this.getAttribute('height') + ';';
    } else {
      extraCss += 'height: 90%;';
    }
    if (this.hasAttribute('width')) {
      extraCss += 'width: ' + this.getAttribute('width') + ';';
    }
    // style
    const styleElement = document.createElement('style');
    styleElement.innerHTML += '.dwv {' + extraCss + '}\n\n';
    styleElement.innerHTML += styles.toString();

    // theme
    const availableThemes = {
      light: themeLight,
      dark: themeDark,
      blue: themeBlue
    }
    let themes = ['light', 'dark'];
    if (this.hasAttribute('theme')) {
      // space separated, keep first 2
      let inputThemes = this.getAttribute('theme').split(' ').slice(0, 2);
      // trim strings
      inputThemes = inputThemes.map((item) => item.trim());
      // keep valid
      inputThemes = inputThemes.filter((item) => {
        return typeof availableThemes[item] !== 'undefined'
      });
      if (inputThemes.length !== 0) {
        themes = inputThemes;
      }
    }
    // use media preference when 2 themes
    if (themes.length === 2) {
      styleElement.innerHTML += '@media (prefers-color-scheme: light) {';
      styleElement.innerHTML += availableThemes[themes[0]].toString();
      styleElement.innerHTML += '}';
      styleElement.innerHTML += '@media (prefers-color-scheme: dark) {';
      styleElement.innerHTML += availableThemes[themes[1]].toString();
      styleElement.innerHTML += '}';
    } else {
      styleElement.innerHTML += availableThemes[themes[0]].toString();
    }
    styleElement.innerHTML += themeCommon.toString();

    // shadow root
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(styleElement);
    shadow.appendChild(container);

    // create options from attributes
    const options = {};
    // load
    if (this.hasAttribute('uri')) {
      options.uri = this.getAttribute('uri');
    } else if (this.hasAttribute('urls')) {
      const trimItem = function (item) {
        return item.trim();
      };
      options.urls = this.getAttribute('urls').split(',').map(trimItem);
    } else if (this.hasAttribute('loadfromwindowlocation')) {
      if (window.location.search !== '') {
        options.uri = window.location.href;
      }
    }
    // window level
    if (this.hasAttribute('wlpresetname') &&
      this.hasAttribute('wlpresetcenter') &&
      this.hasAttribute('wlpresetwidth')) {
      options.wlpreset = {
        name: this.getAttribute('wlpresetname'),
        center: this.getAttribute('wlpresetcenter'),
        width: this.getAttribute('wlpresetwidth')
      };
    }
    if (this.hasAttribute('tools')) {
      options.tools = this.getAttribute('tools');
    }

    // start app
    startApp(appId, options, shadow);
  }

  /**
   * Get the HTML header element.
   *
   * @param {string} appId The app id.
   * @returns {HTMLElement} The element.
   */
  #getHeader(appId) {
    const header = document.createElement('div');
    header.id = 'header-' + appId;
    header.className = 'header';
    header.part = 'header';

    return header;
  }

  /**
   * Get the HTML content element.
   *
   * @param {string} appId The app id.
   * @returns {HTMLElement} The element.
   */
  #getContent(appId) {
    // layer group
    const layerGroup = document.createElement('div');
    layerGroup.id = 'layerGroup-' + appId;
    layerGroup.className = 'layerGroup';
    layerGroup.part = 'layerGroup';
    // drop box
    const dropBox = getDropboxElement(appId);
    layerGroup.appendChild(dropBox);

    // main content div
    const content = document.createElement('div');
    content.id = 'content-' + appId;
    content.className = 'content';
    content.part = 'content';
    content.appendChild(layerGroup);

    // right panel
    const panelElements = getRightPanelElements(appId);
    content.appendChild(panelElements[0]);
    content.appendChild(panelElements[1]);

    return content;
  }

  /**
   * Get the HTML footer element.
   *
   * @param {string} appId The app id.
   * @returns {HTMLElement} The element.
   */
  #getFooter(appId) {
    const dwvLink = document.createElement('a');
    dwvLink.href = 'https://github.com/ivmartel/dwv';
    dwvLink.title = 'dwv on github';
    dwvLink.appendChild(document.createTextNode('dwv'));

    const para = document.createElement('p');
    para.appendChild(document.createTextNode('Powered by '));
    para.appendChild(dwvLink);
    para.appendChild(document.createTextNode(
      ' ' + getDwvVersion() + '.'));

    const footer = document.createElement('div');
    footer.id = 'footer-' + appId;
    footer.className = 'footer';
    footer.part = 'footer';
    footer.appendChild(para);

    return footer;
  }

  /**
   * Get extra element.
   *
   * @param {string} appId The app id.
   * @returns {HTMLElement} The element.
   */
  #getExtra(appId) {
    const modal = getModalElement(appId);
    return modal;
  }
}

// Define the new element
// https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
customElements.define('dwv-simple', DwvComponent);
