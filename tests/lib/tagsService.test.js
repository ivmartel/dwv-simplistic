import {describe, test, expect} from 'vitest';

import {
  TagsService,
  getMergeIds,
  getMetaArray,
  getElementValue,
  filterTags
} from '../../src/lib/tagsService.js';

/**
 * Get a fake dwv app service.
 *
 * @param {object} meta The meta data.
 * @returns {EventTarget} The fake service.
 */
function getFakeService(meta) {
  const service = new EventTarget();
  service.getMetaData = () => meta;
  return service;
}

/**
 * Dispatch a 'dataloaded' event.
 *
 * @param {EventTarget} service The fake service.
 * @param {boolean} value The event value.
 */
function dispatchDataLoaded(service, value) {
  service.dispatchEvent(new CustomEvent('dataloaded', {detail: {value}}));
}

// merged meta data of multi file data (see dwv `mergeObjects`)
const meta = {
  mergeId: ['3', '1', '2'],
  '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
  '00200013': {vr: 'IS', value: {3: ['3'], 1: ['1'], 2: ['2']}}
};

const mergedMeta = {
  mergeId: ['10', '2', '1'],
  '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
  '00200013': {vr: 'IS', value: {10: ['10'], 2: ['2'], 1: ['1']}},
  '00100010': {vr: 'PN', value: ['Doe^John']},
  '00080018': {vr: 'UI', value: {10: ['1.10'], 2: ['1.2'], 1: ['1.1']}},
  '00081140': {
    vr: 'SQ',
    value: {
      10: [{'00081155': {vr: 'UI', value: ['1.2.10']}}],
      2: [{'00081155': {vr: 'UI', value: ['1.2.2']}}],
      1: undefined
    }
  }
};

describe('getMergeIds', () => {
  test('returns sorted merge ids', () => {
    expect(getMergeIds(mergedMeta)).toEqual(['1', '2', '10']);
  });

  test('sorts merge ids with a second id suffix', () => {
    const merged = {mergeId: ['2-1', '1-1', '10-0', '2-0', '1-0']};
    expect(getMergeIds(merged))
      .toEqual(['1-0', '1-1', '2-0', '2-1', '10-0']);
  });

  test('returns an empty array for non merged meta data', () => {
    expect(getMergeIds({'00200013': {vr: 'IS', value: ['7']}}))
      .toEqual([]);
    expect(getMergeIds({width: {value: 1}})).toEqual([]);
  });
});

describe('getElementValue', () => {
  test('returns non merged values', () => {
    expect(getElementValue({value: ['a']}, '1')).toEqual(['a']);
    const typed = new Uint8Array(2);
    expect(getElementValue({value: typed}, '1')).toBe(typed);
    expect(getElementValue({value: 'a'}, undefined)).toBe('a');
  });

  test('returns merged values for the merge id', () => {
    const element = {value: {1: ['a'], 2: ['b']}};
    expect(getElementValue(element, '2')).toEqual(['b']);
    expect(getElementValue(element, '3')).toBeUndefined();
    expect(getElementValue(element, undefined)).toBeUndefined();
  });
});

describe('filterTags', () => {
  const tags = [
    {name: 'PatientName', value: 'Doe^John'},
    {name: 'Rows', value: 512},
    {name: 'Modality', value: 'MR'}
  ];

  test('returns the input without search', () => {
    expect(filterTags(tags, '')).toBe(tags);
    expect(filterTags(tags, '  ')).toBe(tags);
  });

  test('matches names and values, case insensitive', () => {
    expect(filterTags(tags, 'patient')).toEqual([tags[0]]);
    expect(filterTags(tags, ' JOHN ')).toEqual([tags[0]]);
    expect(filterTags(tags, '51')).toEqual([tags[1]]);
    expect(filterTags(tags, 'o')).toEqual(tags);
    expect(filterTags(tags, 'xyz')).toEqual([]);
  });
});

describe('TagsService', () => {
  test('starts empty', () => {
    const tagsService = new TagsService(getFakeService(meta));
    expect(tagsService.getSnapshot()).toEqual({
      mergeIds: [],
      mergeId: undefined,
      search: '',
      tags: []
    });
  });

  test('loads the state on data loaded', () => {
    const service = getFakeService(meta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    let calls = 0;
    tagsService.subscribe(() => ++calls);
    dispatchDataLoaded(service, true);
    expect(calls).toBe(1);
    const state = tagsService.getSnapshot();
    expect(state.mergeIds).toEqual(['1', '2', '3']);
    expect(state.mergeId).toBe('1');
    expect(state.tags[1]).toEqual({name: 'InstanceNumber', value: '1'});
  });

  test('clears the state on load start', () => {
    const service = getFakeService(meta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    dispatchDataLoaded(service, true);
    dispatchDataLoaded(service, false);
    expect(tagsService.getSnapshot().tags).toEqual([]);
  });

  test('selects a merge id', () => {
    const service = getFakeService(meta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    dispatchDataLoaded(service, true);
    const before = tagsService.getSnapshot();
    tagsService.setMergeId('1');
    // no change: same snapshot
    expect(tagsService.getSnapshot()).toBe(before);
    tagsService.setMergeId('3');
    const state = tagsService.getSnapshot();
    expect(state).not.toBe(before);
    expect(state.mergeIds).toBe(before.mergeIds);
    expect(state.mergeId).toBe('3');
    expect(state.tags[1]).toEqual({name: 'InstanceNumber', value: '3'});
  });

  test('filters the tags with a search string', () => {
    const service = getFakeService(meta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    dispatchDataLoaded(service, true);
    const before = tagsService.getSnapshot();
    tagsService.setSearch('');
    // no change: same snapshot
    expect(tagsService.getSnapshot()).toBe(before);
    tagsService.setSearch('instance');
    let state = tagsService.getSnapshot();
    expect(state.search).toBe('instance');
    expect(state.tags).toEqual([{name: 'InstanceNumber', value: '1'}]);
    // kept on merge id change
    tagsService.setMergeId('2');
    state = tagsService.getSnapshot();
    expect(state.tags).toEqual([{name: 'InstanceNumber', value: '2'}]);
    // kept on new data
    dispatchDataLoaded(service, false);
    expect(tagsService.getSnapshot().search).toBe('instance');
    expect(tagsService.getSnapshot().tags).toEqual([]);
    dispatchDataLoaded(service, true);
    expect(tagsService.getSnapshot().tags)
      .toEqual([{name: 'InstanceNumber', value: '1'}]);
    // clear search
    tagsService.setSearch('');
    expect(tagsService.getSnapshot().tags.length).toBe(2);
  });

  test('loads merged meta data', () => {
    const service = getFakeService(mergedMeta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    dispatchDataLoaded(service, true);
    expect(tagsService.getSnapshot().mergeIds)
      .toEqual(['1', '2', '10']);
    tagsService.setMergeId('10');
    expect(tagsService.getSnapshot().tags).toEqual([
      {name: 'TransferSyntaxUID', value: '1.2.840.10008.1.2.1'},
      {name: 'InstanceNumber', value: '10'},
      {name: 'PatientName', value: 'Doe^John'},
      {name: 'SOPInstanceUID', value: '1.10'},
      {name: 'ReferencedImageSequence', value: ''},
      {name: '[0] ReferencedSOPInstanceUID', value: '1.2.10'}
    ]);
    // element not present for a merge id
    tagsService.setMergeId('1');
    expect(tagsService.getSnapshot().tags.slice(4)).toEqual([
      {name: 'ReferencedImageSequence', value: ''}
    ]);
  });

  test('loads non merged meta data', () => {
    const service = getFakeService({
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00200013': {vr: 'IS', value: ['7']}
    });
    const tagsService = new TagsService(service);
    tagsService.connect();
    dispatchDataLoaded(service, true);
    const state = tagsService.getSnapshot();
    expect(state.mergeIds).toEqual([]);
    expect(state.mergeId).toBeUndefined();
    expect(state.tags[1]).toEqual({name: 'InstanceNumber', value: '7'});
  });

  test('stops listening on dispose', () => {
    const service = getFakeService(meta);
    const tagsService = new TagsService(service);
    tagsService.connect();
    let calls = 0;
    tagsService.subscribe(() => ++calls);
    tagsService.dispose();
    dispatchDataLoaded(service, true);
    expect(calls).toBe(0);
    expect(tagsService.getSnapshot().tags).toEqual([]);
  });
});

describe('getMetaArray', () => {
  test('flattens simple meta data', () => {
    const meta = {
      width: {value: 512},
      name: {value: 'test'}
    };
    expect(getMetaArray(meta)).toEqual([
      {name: 'width', value: 512},
      {name: 'name', value: 'test'}
    ]);
  });

  test('flattens merged simple meta data', () => {
    const meta = {
      mergeId: ['a', 'b'],
      width: {value: 512},
      name: {value: {a: 'test-a'}}
    };
    expect(getMetaArray(meta, 'a')).toEqual([
      {name: 'width', value: 512},
      {name: 'name', value: 'test-a'}
    ]);
    expect(getMetaArray(meta, 'b')[1]).toEqual({name: 'name', value: ''});
  });

  test('uses dictionary names for DICOM meta data', () => {
    const meta = {
      // transfer syntax: flags the meta as DICOM
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00100010': {vr: 'PN', value: ['Doe^John']}
    };
    expect(getMetaArray(meta)).toEqual([
      {name: 'TransferSyntaxUID', value: '1.2.840.10008.1.2.1'},
      {name: 'PatientName', value: 'Doe^John'}
    ]);
  });

  test('prefixes sequence items', () => {
    const meta = {
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00081140': {
        vr: 'SQ',
        value: [
          {'00081150': {vr: 'UI', value: ['1.2.3']}}
        ]
      }
    };
    expect(getMetaArray(meta).slice(1)).toEqual([
      {name: 'ReferencedImageSequence', value: ''},
      {name: '[0] ReferencedSOPClassUID', value: '1.2.3'}
    ]);
  });

  test('shortens long other data', () => {
    const meta = {
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00091001': {vr: 'OB', value: new Uint8Array(20)}
    };
    expect(getMetaArray(meta)[1].value)
      .toBe('0,0,0,0,0,0,0,0,0,0... (len:20)');
  });
});
