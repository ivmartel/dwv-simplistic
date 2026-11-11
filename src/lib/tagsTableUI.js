/**
 * @import {TagsService} from './tagsService.js';
 */

/**
 * DICOM tags table rendering: an instance number slider and the tags of
 * the selected instance as an HTML table (logic in './tagsService.js').
 */
export class TagsTableUI {

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
   * @param {TagsService} tagsService The tags service.
   * @param {string} uid The GUI UID.
   */
  constructor(tagsService, uid) {
    this.#tagsService = tagsService;
    this.#uid = uid;
  }

  /**
   * Get the tags table content: title, instance number slider and
   * scrollable tags table.
   *
   * @returns {HTMLElement[]} The content elements.
   */
  getContent() {
    // title
    const title = document.createElement('h2');
    title.appendChild(document.createTextNode('DICOM Tags'));

    const instanceNumbers = this.#tagsService.getInstanceNumbers();

    // div with enabled scroll
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-content-scroll';

    // slider
    const sliderCb = (value) => {
      const metaTab = arrayToHtmlTable(this.#tagsService.getTags(value));
      scrollDiv.replaceChildren(metaTab);
    };
    const sliderDiv = getSliderDiv(
      'instancenumber-slider-' + this.#uid,
      'Instance Number',
      instanceNumbers,
      sliderCb
    );

    // meta data html table
    const instanceNumber = instanceNumbers[0];
    const metaTable = arrayToHtmlTable(
      this.#tagsService.getTags(instanceNumber));
    scrollDiv.appendChild(metaTable);

    return [title, sliderDiv, scrollDiv];
  }

} // class TagsTableUI

/**
 * Get a slider div with a slider and value.
 *
 * @param {string} id The slider id.
 * @param {string} title The slider title.
 * @param {number[]} values The slider values.
 * @param {Function} callback The slider change callback.
 * @returns {HTMLDivElement} The slider div.
 */
function getSliderDiv(id, title, values, callback) {
  // slider input
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = id;
  slider.title = title;
  slider.min = 0;
  slider.max = values.length - 1;
  slider.value = 0;
  // slider label
  const sliderLabel = document.createElement('label');
  sliderLabel.id = id + '-label';
  sliderLabel.for = slider.id;
  sliderLabel.appendChild(document.createTextNode(values[slider.value]));
  sliderLabel.title = slider.title;
  // navigate in values
  slider.addEventListener('input', function (event) {
    const value = values[event.target.value];
    sliderLabel.replaceChildren(document.createTextNode(value));
    // call input callback
    callback(value);
  });
  // container div
  const sliderDiv = document.createElement('div');
  sliderDiv.appendChild(slider);
  sliderDiv.appendChild(sliderLabel);

  return sliderDiv;
}

/**
 * Get an HTML table from a string array.
 *
 * @param {string[]} arr The input array.
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
