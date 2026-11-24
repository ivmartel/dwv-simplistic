import {getTagFromKey, getDicomTagInfo} from 'dwv';

/**
 * @import {DwvAppService} from './dwvAppService.js';
 */

/**
 * Note: follows the design of './annotationService.js'
 *   (logic and state here, rendering in './tagsTable.js').
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
 * Merged meta data (several slices or volumes, see dwv `mergeObjects`)
 *   has a `mergeId` list and, for the elements that differ between the
 *   merged items, a value object indexed by merge id.
 *
 * @typedef {object} TagsState
 * @property {string[]} mergeIds The sorted merge ids (instance numbers,
 *   with a possible '-<secondId>' suffix for multi volume data),
 *   empty if the meta data is not merged.
 * @property {string|undefined} mergeId The selected merge id.
 * @property {string} search The search string, empty for no search.
 * @property {TagItemState[]} tags The tags of the selected merge id
 *   matching the search.
 */

/**
 * Key of the merge id list in merged meta data.
 */
const MERGE_ID_KEY = 'mergeId';

/**
 * Get the sorted list of merge ids of meta data.
 *
 * @param {object} metaData The meta data.
 * @returns {string[]} The merge ids, empty if the meta data
 *   is not merged.
 */
export function getMergeIds(metaData) {
  const mergeIds = metaData[MERGE_ID_KEY];
  if (!Array.isArray(mergeIds)) {
    return [];
  }
  // numerical sort
  return mergeIds.map(String).sort(function (a, b) {
    return a.localeCompare(b, undefined, {numeric: true});
  });
}

/**
 * Filter tags with a search string: keep the tags which name or value
 *   contains it, case insensitive.
 *
 * @param {TagItemState[]} tags The tags to filter.
 * @param {string} search The search string, empty or blank for no search.
 * @returns {TagItemState[]} The matching tags, the input array
 *   if there is no search.
 */
export function filterTags(tags, search) {
  const term = search.trim().toLowerCase();
  if (term.length === 0) {
    return tags;
  }
  return tags.filter((tag) =>
    String(tag.name).toLowerCase().includes(term) ||
    String(tag.value).toLowerCase().includes(term));
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
   * All the tags of the selected instance (not filtered).
   *
   * @type {TagItemState[]}
   */
  #allTags = [];

  /**
   * The current snapshot.
   *
   * @type {TagsState}
   */
  #snapshot = {
    mergeIds: [],
    mergeId: undefined,
    search: '',
    tags: []
  };

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
   * Select the merge id to show the tags of.
   *
   * @param {string} mergeId The merge id.
   */
  setMergeId(mergeId) {
    if (typeof this.#metaData === 'undefined' ||
      mergeId === this.#snapshot.mergeId) {
      return;
    }
    this.#allTags = getMetaArray(this.#metaData, mergeId);
    this.#emit({
      ...this.#snapshot,
      mergeId,
      tags: filterTags(this.#allTags, this.#snapshot.search)
    });
  }

  /**
   * Set the search string: only the tags which name or value
   *   contains it are kept, case insensitive.
   *
   * @param {string} search The search string, empty for no search.
   */
  setSearch(search) {
    if (search === this.#snapshot.search) {
      return;
    }
    this.#emit({
      ...this.#snapshot,
      search,
      tags: filterTags(this.#allTags, search)
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
   *   The search string is kept.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataLoaded(event) {
    if (!event.detail.value) {
      this.#metaData = undefined;
      this.#allTags = [];
      this.#emit({
        ...this.#snapshot,
        mergeIds: [],
        mergeId: undefined,
        tags: []
      });
      return;
    }
    // TODO allow for different dataid
    this.#metaData = this.#dwvAppService.getMetaData();
    const mergeIds = getMergeIds(this.#metaData);
    const mergeId = mergeIds[0];
    this.#allTags = getMetaArray(this.#metaData, mergeId);
    this.#emit({
      ...this.#snapshot,
      mergeIds,
      mergeId,
      tags: filterTags(this.#allTags, this.#snapshot.search)
    });
  }

} // class TagsService

/**
 * Get the meta data as an array.
 *
 * @param {any} meta The meta data.
 * @param {string|undefined} mergeId The merge id, undefined if the
 *   meta data is not merged.
 * @returns {TagItemState[]} The meta data as a flat array.
 */
export function getMetaArray(meta, mergeId) {
  let reducer;
  if (isDicomMeta(meta)) {
    reducer = getDicomTagReducer(meta, mergeId, '');
  } else {
    reducer = getTagReducer(meta, mergeId);
  }
  // skip the merge id list of merged meta data
  const keys = Object.keys(meta).filter((key) => key !== MERGE_ID_KEY);
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
 * Get the value of an element for a merge id: merged elements
 *   which values differ have a value object indexed by merge id.
 *
 * @param {any} element The data element.
 * @param {string|undefined} mergeId The merge id.
 * @returns {any} The element value, undefined or null if the
 *   element is not present for the merge id.
 */
export function getElementValue(element, mergeId) {
  const value = element.value;
  if (typeof value === 'object' && value !== null &&
    !Array.isArray(value) && !ArrayBuffer.isView(value)) {
    return typeof mergeId !== 'undefined' ? value[mergeId] : undefined;
  }
  return value;
}

/**
 * Get a simple data array reducer.
 *
 * @param {any} tagData Simple data with a 'value' property.
 * @param {string|undefined} mergeId The merge id.
 * @returns {Function} The data reducer.
 */
function getTagReducer(tagData, mergeId) {
  return function (accumulator, currentValue) {
    const value = getElementValue(tagData[currentValue], mergeId);
    accumulator.push({
      name: currentValue,
      value: typeof value === 'undefined' || value === null
        ? '' : value
    });
    return accumulator;
  };
}

/**
 * Get a DICOM data array reducer.
 *
 * @param {any} tagData DICOM data.
 * @param {string|undefined} mergeId The merge id.
 * @param {string} prefix The prefix.
 * @returns {Function} The data reducer.
 */
function getDicomTagReducer(tagData, mergeId, prefix) {
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
    const name = (prefix ? prefix + ' ' : '') + key;
    const element = tagData[currentValue];
    const value = getElementValue(element, mergeId);
    // element not present for this merge id
    if (typeof value === 'undefined' || value === null) {
      accumulator.push({name, value: ''});
      return accumulator;
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({name, value: ''});
      // sequence items
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i];
        const keys = Object.keys(sqItems);
        const res = keys.reduce(
          getDicomTagReducer(sqItems, mergeId, prefix + '[' + i + ']'), []
        );
        accumulator = accumulator.concat(res);
      }
    } else {
      let strValue;
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 10) {
        strValue = value.slice(0, 10).toString() +
          '... (len:' + value.length + ')';
      } else {
        strValue = value.toString();
      }
      accumulator.push({name, value: strValue});
    }
    return accumulator;
  };
}
