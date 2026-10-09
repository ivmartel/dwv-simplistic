import {describe, test, expect} from 'vitest';

import {getMetaArray} from '../../src/gui/meta.js';

describe('getMetaArray', () => {
  test('flattens simple meta data', () => {
    const meta = {
      width: {value: 512},
      name: {value: 'test'}
    };
    expect(getMetaArray(meta, 0)).toEqual([
      {name: 'width', value: 512},
      {name: 'name', value: 'test'}
    ]);
  });

  test('uses dictionary names for DICOM meta data', () => {
    const meta = {
      // transfer syntax: flags the meta as DICOM
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00100010': {vr: 'PN', value: ['Doe^John']}
    };
    expect(getMetaArray(meta, 0)).toEqual([
      {name: 'TransferSyntaxUID', value: '1.2.840.10008.1.2.1'},
      {name: 'PatientName', value: 'Doe^John'}
    ]);
  });

  test('forces the instance number', () => {
    const meta = {
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00200013': {vr: 'IS', value: ['1']}
    };
    const res = getMetaArray(meta, 5);
    expect(res[1]).toEqual({name: 'InstanceNumber', value: '5'});
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
    expect(getMetaArray(meta, 0).slice(1)).toEqual([
      {name: 'ReferencedImageSequence', value: ''},
      {name: '[0] ReferencedSOPClassUID', value: '1.2.3'}
    ]);
  });

  test('shortens long other data', () => {
    const meta = {
      '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
      '00091001': {vr: 'OB', value: new Uint8Array(20)}
    };
    expect(getMetaArray(meta, 0)[1].value)
      .toBe('0,0,0,0,0,0,0,0,0,0... (len:20)');
  });
});
