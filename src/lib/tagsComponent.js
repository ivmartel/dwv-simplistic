/**
 * @import {TagsService, TagsState} from './tagsService.js';
 */

/**
 * Note: follows the design of './annotationComponent.js'
 *   (rendering here, logic and state in './tagsService.js').
 */

/**
 * Tags component: renders the tags service state as an instance
 *   number slider, a search input and a tags table, and calls
 *   the service actions.
 */
export class TagsComponent {

  /**
   * The tags service.
   *
   * @type {TagsService}
   */
  #tagsService;

  /**
   * The GUI UID.
   *
   * @type {string}
   */
  #uid;

  /**
   * The unsubscribe function.
   *
   * @type {Function|undefined}
   */
  #unsubscribe;

  /**
   * The last rendered state.
   *
   * @type {TagsState|undefined}
   */
  #renderedState;

  /**
   * The content elements.
   *
   * @type {HTMLElement[]|undefined}
   */
  #content;

  /**
   * The instance number slider.
   *
   * @type {HTMLInputElement|undefined}
   */
  #slider;

  /**
   * The instance number slider label.
   *
   * @type {HTMLLabelElement|undefined}
   */
  #sliderLabel;

  /**
   * The tags search input.
   *
   * @type {HTMLInputElement|undefined}
   */
  #searchInput;

  /**
   * The scrollable tags table container.
   *
   * @type {HTMLDivElement|undefined}
   */
  #scrollDiv;

  /**
   * @param {TagsService} tagsService The tags service.
   * @param {string} uid The GUI UID.
   */
  constructor(tagsService, uid) {
    this.#tagsService = tagsService;
    this.#uid = uid;
  }

  /**
   * Subscribe to the tags service and render.
   */
  registerListeners() {
    this.#unsubscribe = this.#tagsService.subscribe(this.#render);
    this.#render();
  }

  /**
   * Unsubscribe from the tags service.
   */
  dispose() {
    if (typeof this.#unsubscribe !== 'undefined') {
      this.#unsubscribe();
      this.#unsubscribe = undefined;
    }
  }

  /**
   * Get the content elements: title, controls (search input and
   *   instance number slider) and scrollable tags table.
   *   Always returns the same elements.
   *
   * @returns {HTMLElement[]} The content elements.
   */
  getContent() {
    if (typeof this.#content === 'undefined') {
      this.#setupHtml();
      this.#renderedState = undefined;
      this.#render();
    }
    return this.#content;
  }

  /**
   * Create the content elements.
   */
  #setupHtml() {
    // title
    const title = document.createElement('h2');
    title.appendChild(document.createTextNode('DICOM Tags'));

    // slider input
    const sliderId = 'instancenumber-slider-' + this.#uid;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = sliderId;
    slider.title = 'Instance Number';
    slider.min = 0;
    // slider label
    const sliderLabel = document.createElement('label');
    sliderLabel.id = sliderId + '-label';
    sliderLabel.htmlFor = sliderId;
    sliderLabel.title = slider.title;
    // navigate in instance numbers
    slider.addEventListener('input', (event) => {
      const instanceNumbers = this.#tagsService.getSnapshot().instanceNumbers;
      this.#tagsService.setInstanceNumber(
        instanceNumbers[event.target.value]);
    });
    // container span (hidden without instance number)
    const sliderSpan = document.createElement('span');
    sliderSpan.appendChild(slider);
    sliderSpan.appendChild(sliderLabel);

    // search input
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'tags-search-' + this.#uid;
    searchInput.placeholder = 'Search tags';
    searchInput.title = 'Search in tag names and values';
    searchInput.className = 'tags-search';
    searchInput.addEventListener('input', (event) => {
      this.#tagsService.setSearch(event.target.value);
    });
    // controls div: search and slider on the same line
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'tags-controls';
    controlsDiv.appendChild(searchInput);
    controlsDiv.appendChild(sliderSpan);

    // div with enabled scroll
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-content-scroll';

    this.#slider = slider;
    this.#sliderLabel = sliderLabel;
    this.#searchInput = searchInput;
    this.#scrollDiv = scrollDiv;
    this.#content = [title, controlsDiv, scrollDiv];
  }

  /**
   * Render the tags service state.
   */
  #render = () => {
    if (typeof this.#content === 'undefined') {
      // nothing to render into yet
      return;
    }
    const state = this.#tagsService.getSnapshot();
    if (state === this.#renderedState) {
      return;
    }
    const previous = this.#renderedState;
    this.#renderedState = state;

    // slider
    if (state.instanceNumbers !== previous?.instanceNumbers) {
      this.#slider.max = Math.max(state.instanceNumbers.length - 1, 0);
      this.#slider.parentElement.style.display =
        state.instanceNumbers.length === 0 ? 'none' : '';
    }
    const index = state.instanceNumbers.indexOf(state.instanceNumber);
    this.#slider.value = Math.max(index, 0);
    this.#sliderLabel.replaceChildren(document.createTextNode(
      typeof state.instanceNumber !== 'undefined'
        ? state.instanceNumber : ''));

    // search
    if (this.#searchInput.value !== state.search) {
      this.#searchInput.value = state.search;
    }

    // table
    if (state.tags !== previous?.tags) {
      let table;
      if (state.tags.length === 0 && state.search.trim().length !== 0) {
        table = document.createElement('p');
        table.appendChild(document.createTextNode(
          'No tag matching \'' + state.search.trim() + '\'.'));
      } else {
        table = arrayToHtmlTable(state.tags);
      }
      this.#scrollDiv.replaceChildren(table);
    }
  };

} // class TagsComponent

/**
 * Get an HTML table from a string array.
 *
 * @param {object[]} arr The input array.
 * @returns {HTMLTableElement} The HTML table element.
 */
export function arrayToHtmlTable(arr) {
  const table = document.createElement('table');
  let row;
  let cell;

  // check input
  if (typeof arr === 'undefined' ||
    arr.length === 0) {
    row = table.insertRow(-1);
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode('Empty input array...'));
    row.appendChild(cell);
    return table;
  }

  // extract keys from first element
  const item0 = arr[0];
  const keys = Object.keys(item0);

  // table body
  for (let i = 0; i < arr.length; ++i) {
    row = table.insertRow(-1);
    for (let j = 0; j < keys.length; ++j) {
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(arr[i][keys[j]]));
      row.appendChild(cell);
    }
  }
  // table head
  const thead = table.createTHead();
  const th = thead.insertRow(-1);
  for (let k = 0; k < keys.length; ++k) {
    const hcell = document.createElement('th');
    let key = keys[k];
    key = key.charAt(0).toUpperCase() + key.slice(1);
    hcell.appendChild(document.createTextNode(key));
    th.appendChild(hcell);
  }

  return table;
}
