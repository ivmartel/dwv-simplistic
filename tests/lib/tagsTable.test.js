import {describe, test, expect} from 'vitest';

import {
  TagsTable,
  arrayToHtmlTable,
  getMetaArray
} from '../../src/lib/tagsTable.js';

describe('arrayToHtmlTable', () => {
  test('returns a placeholder for empty input', () => {
    const table = arrayToHtmlTable([]);
    expect(table.rows.length).toBe(1);
    expect(table.textContent).toBe('Empty input array...');
  });

  test('builds header and body rows', () => {
    const table = arrayToHtmlTable([
      {name: 'a', value: '1'},
      {name: 'b', value: '2'}
    ]);
    const headers = [...table.tHead.rows[0].cells].map(c => c.textContent);
    expect(headers).toEqual(['Name', 'Value']);
    const body = table.tBodies[0].rows;
    expect(body.length).toBe(2);
    expect(body[1].cells[0].textContent).toBe('b');
    expect(body[1].cells[1].textContent).toBe('2');
  });
});

describe('TagsTable', () => {
  const meta = {
    '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
    '00200013': {vr: 'IS', value: ['3', '1', '2']}
  };
  const service = {
    getOptions: () => ({uid: 'test'}),
    getMetaData: () => meta
  };

  test('builds title, slider and table', () => {
    const [title, sliderDiv, scrollDiv] =
      new TagsTable(service).getContent();
    expect(title.textContent).toBe('DICOM Tags');
    const slider = sliderDiv.querySelector('input');
    expect(slider.id).toBe('instancenumber-slider-test');
    expect(slider.max).toBe('2');
    // sorted instance numbers: first is 1
    expect(sliderDiv.querySelector('label').textContent).toBe('1');
    expect(scrollDiv.querySelector('table').textContent)
      .toContain('InstanceNumber1');
  });

  test('updates the table on slider input', () => {
    const [, sliderDiv, scrollDiv] = new TagsTable(service).getContent();
    const slider = sliderDiv.querySelector('input');
    slider.value = '2';
    slider.dispatchEvent(new Event('input'));
    expect(sliderDiv.querySelector('label').textContent).toBe('3');
    expect(scrollDiv.querySelector('table').textContent)
      .toContain('InstanceNumber3');
  });
});

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
