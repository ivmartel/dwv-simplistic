import {getTagFromKey, getDicomTagInfo} from 'dwv';

/**
 * @import {DwvAppService} from './dwvAppService.js';
 */

/**
 * Note: follows the design of './annotationService.js'
 *   (logic and state here, rendering in './tagsComponent.js').
 */

/**
 * Tag state: plain data, do not modify.
 *
 * @typedef {object} TagItemState
 * @property {string} name The tag name.
 * @property {string|number} value The tag value.
 */

/**
 * Tags state: plain data, do not modify.
 *
 * @typedef {object} TagsState
 * @property {string[]} instanceNumbers The sorted instance numbers,
 *   empty if the data has no InstanceNumber.
 * @property {string|undefined} instanceNumber The selected
 *   instance number.
 * @property {TagItemState[]} tags The tags of the selected instance.
 */

/**
 * Get the sorted list of instance numbers of meta data.
 *
 * For merged meta data (multi file data), they are the dwv merge ids:
 *   instance numbers with a possible '-<secondId>' suffix, used as keys
 *   of the merged values (see dwv `mergeObjects`).
 *
 * @param {object} metaData The meta data.
 * @returns {string[]} The instance numbers, empty if the meta data
 *   has no InstanceNumber.
 */
export function getInstanceNumbers(metaData) {
  let instanceNumbers;
  if (typeof metaData.mergeId !== 'undefined') {
    // merged meta data
    instanceNumbers = metaData.mergeId.map(String);
  } else {
    // InstanceNumber
    const instanceElement = metaData['00200013'];
    if (typeof instanceElement === 'undefined') {
      return [];
    }
    let instanceNumberValue = instanceElement.value;
    if (typeof instanceNumberValue === 'string') {
      instanceNumberValue = [instanceNumberValue];
    }
    instanceNumbers = instanceNumberValue.map(String);
  }
  // numerical sort
  return instanceNumbers.sort(function (a, b) {
    return parseFloat(a) - parseFloat(b) || a.localeCompare(b);
  });
}

/**
 * Tags service: framework agnostic DICOM tags logic and state
 *   on top of the dwv app service, no DOM access.
 *
 * The state follows the external store contract
 *   (`subscribe` / `getSnapshot`).
 *
 * Usage: `connect()` once before loading data, `dispose()` when done.
 */
export class TagsService {

  /**
   * The dwv app service.
   *
   * @type {DwvAppService}
   */
  #dwvAppService;

  /**
   * The meta data of the loaded data.
   *
   * @type {object|undefined}
   */
  #metaData;

  /**
   * The current snapshot.
   *
   * @type {TagsState}
   */
  #snapshot = {instanceNumbers: [], instanceNumber: undefined, tags: []};

  /**
   * The state change listeners.
   *
   * @type {Set<Function>}
   */
  #listeners = new Set();

  /**
   * The dwv app service event handlers.
   *
   * @type {Record<string, Function>}
   */
  #handlers = {
    dataloaded: (event) => this.#onDataLoaded(event)
  };

  /**
   * @param {DwvAppService} service The associated dwv app service.
   */
  constructor(service) {
    this.#dwvAppService = service;
  }

  // store contract

  /**
   * Get the current state. Returns the same object as long
   *   as the state does not change.
   *
   * @returns {TagsState} The state.
   */
  getSnapshot = () => {
    return this.#snapshot;
  };

  /**
   * Subscribe to state changes.
   *
   * @param {Function} listener The listener, called without
   *   arguments after each change.
   * @returns {Function} The unsubscribe function.
   */
  subscribe = (listener) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  // lifecycle

  /**
   * Listen to the dwv app service events.
   */
  connect() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvAppService.addEventListener(type, handler);
    }
  }

  /**
   * Stop listening to the dwv app service events, remove the subscribers.
   */
  dispose() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvAppService.removeEventListener(type, handler);
    }
    this.#listeners.clear();
  }

  // actions

  /**
   * Select the instance number to show the tags of.
   *
   * @param {string} instanceNumber The instance number.
   */
  setInstanceNumber(instanceNumber) {
    if (typeof this.#metaData === 'undefined' ||
      instanceNumber === this.#snapshot.instanceNumber) {
      return;
    }
    this.#emit({
      ...this.#snapshot,
      instanceNumber,
      tags: getMetaArray(this.#metaData, instanceNumber)
    });
  }

  // internals

  /**
   * Set a new snapshot and notify the listeners.
   *
   * @param {TagsState} snapshot The new snapshot.
   */
  #emit(snapshot) {
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) {
      listener();
    }
  }

  /**
   * Handle 'dataloaded' event: reset the state from the
   *   loaded meta data, or clear it when a new load starts.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataLoaded(event) {
    if (!event.detail.value) {
      this.#metaData = undefined;
      this.#emit({instanceNumbers: [], instanceNumber: undefined, tags: []});
      return;
    }
    // TODO allow for different dataid
    this.#metaData = this.#dwvAppService.getMetaData();
    const instanceNumbers = getInstanceNumbers(this.#metaData);
    const instanceNumber = instanceNumbers[0];
    this.#emit({
      instanceNumbers,
      instanceNumber,
      tags: getMetaArray(this.#metaData, instanceNumber)
    });
  }

} // class TagsService

/**
 * Get the meta data as an array.
 *
 * @param {any} meta The meta data.
 * @param {string} instanceNumber The instance number.
 * @returns {TagItemState[]} The meta data as a flat array.
 */
export function getMetaArray(meta, instanceNumber) {
  let reducer;
  if (isDicomMeta(meta)) {
    reducer = getDicomTagReducer(meta, instanceNumber, '');
  } else {
    reducer = getTagReducer(meta);
  }
  // skip the dwv merge ids of merged meta data
  const keys = Object.keys(meta).filter((key) => key !== 'mergeId');
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
 * @param {string} instanceNumber The instance number.
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
