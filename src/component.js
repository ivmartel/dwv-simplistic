import {getDwvVersion} from 'dwv';
import {startApp} from './applauncher';

// Create a class for the element
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

    // legend
    const legend = document.createElement('div');
    legend.id = 'legend-' + appId;
    legend.className = 'legend';

    const dwvLink = document.createElement('a');
    dwvLink.href = 'https://github.com/ivmartel/dwv';
    dwvLink.title = 'dwv on github';
    dwvLink.appendChild(document.createTextNode('dwv'));

    const para = document.createElement('p');
    para.appendChild(document.createTextNode('Powered by '));
    para.appendChild(dwvLink);
    para.appendChild(document.createTextNode(
      ' ' + getDwvVersion() + '.'));

    legend.appendChild(para);

    // fill container
    container.appendChild(toolbar);
    container.appendChild(layerGroup);
    if (this.hasAttribute('showLegend') &&
      this.getAttribute('showLegend') === 'true') {
      container.appendChild(legend);
    }

    // shadow root
    const shadow = this.attachShadow({mode: 'open'});
    // style
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    style.setAttribute('href', 'style.css');
    // fill shadow root
    shadow.appendChild(style);
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
