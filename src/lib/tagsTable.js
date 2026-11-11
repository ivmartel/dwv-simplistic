import {getTagFromKey, getDicomTagInfo} from 'dwv';

/**
 * @import {DwvAppService} from './dwvAppService.js';
 */

/**
 * DICOM tags table: an instance number slider and the tags of
 * the selected instance as an HTML table.
 */
export class TagsTable {

  /**
   * The dwv app service.
   *
   * @type {DwvAppService}
   */
  #dwvAppService;

  /**
   * The GUI UID.
   *
   * @type {string}
   */
  #uid;

  /**
   * @param {DwvAppService} dwvAppService The dwv app service.
   */
  constructor(dwvAppService) {
    this.#dwvAppService = dwvAppService;
    this.#uid = dwvAppService.getOptions().uid;
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

    // TODO allow for different dataid
    const metaData = this.#dwvAppService.getMetaData();

    // InstanceNumber
    const instanceElement = metaData['00200013'];
    // list of possible instance numbers
    let instanceNumbers;
    if (typeof instanceElement !== 'undefined') {
      let instanceNumberValue = instanceElement.value;
      if (typeof instanceNumberValue === 'string') {
        instanceNumberValue = [instanceNumberValue];
      }
      // convert string to numbers
      instanceNumbers = instanceNumberValue.map(Number);
      // sort
      instanceNumbers.sort(function (a, b) {
        return a - b;
      });
    }

    // div with enabled scroll
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-content-scroll';

    // slider
    const sliderCb = function (value) {
      const metaArr = getMetaArray(metaData, value);
      const metaTab = arrayToHtmlTable(metaArr);
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
    const metaArray = getMetaArray(metaData, instanceNumber);
    const metaTable = arrayToHtmlTable(metaArray);
    scrollDiv.appendChild(metaTable);

    return [title, sliderDiv, scrollDiv];
  }

} // class TagsTable

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

/**
 * Get the meta data as an array.
 *
 * @param {any} meta The meta data.
 * @param {number} instanceNumber The instance number.
 * @returns {string[]} The meta data as a flat string array.
 */
export function getMetaArray(meta, instanceNumber) {
  let reducer;
  if (isDicomMeta(meta)) {
    reducer = getDicomTagReducer(meta, instanceNumber, '');
  } else {
    reducer = getTagReducer(meta);
  }
  const keys = Object.keys(meta);
  return keys.reduce(reducer, []);
}

/**
 * Check if a meta data is a dicom one.
 *
 * @param {any} meta The dicom meta data.
 * @returns {boolean} True if the meta data is a DICOM one.
 */
function isDicomMeta(meta) {
  // true if it has a Transfer Syntax
  return typeof meta['00020010'] !== 'undefined';
}

/**
 * Get a simple data array reducer.
 *
 * @param {any} tagData Simple data with a 'value' property.
 * @returns {Function} The data recuder.
 */
function getTagReducer(tagData) {
  return function (accumulator, currentValue) {
    accumulator.push({
      name: currentValue,
      value: tagData[currentValue].value
    });
    return accumulator;
  };
}

/**
 * Get a DICOM data array reducer.
 *
 * @param {any} tagData DICOM data.
 * @param {number} instanceNumber The instance number.
 * @param {string} prefix The prefix.
 * @returns {Function} The data reducer.
 */
function getDicomTagReducer(tagData, instanceNumber, prefix) {
  return function (accumulator, currentValue) {
    const tag = getTagFromKey(currentValue);
    const tagInfo = getDicomTagInfo(tag);
    let key;
    if (typeof tagInfo !== 'undefined') {
      key = tagInfo.getName();
    } else {
      // add 'x' to help sorting
      key = 'x' + tag.getKey();
    }
    const name = key;
    const element = tagData[currentValue];
    let value = element.value;
    // possible 'merged' object
    // (use slice method as test for array and typed array)
    if (typeof value.slice === 'undefined' &&
      typeof value[instanceNumber] !== 'undefined') {
      value = value[instanceNumber];
    }
    // force instance number (otherwise takes value in non indexed array)
    if (name === 'InstanceNumber') {
      value = instanceNumber;
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: ''
      });
      // sequence value
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i];
        const keys = Object.keys(sqItems);
        const res = keys.reduce(
          getDicomTagReducer(
            sqItems, instanceNumber, prefix + '[' + i + ']'), []
        );
        accumulator = accumulator.concat(res);
      }
    } else {
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 10) {
        value = value.slice(0, 10).toString() +
          '... (len:' + value.length + ')';
      }
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: value.toString()
      });
    }
    return accumulator;
  };
}
