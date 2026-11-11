import {describe, test, expect} from 'vitest';

import {TagsService} from '../../src/lib/tagsService.js';
import {
  TagsTableUI,
  arrayToHtmlTable
} from '../../src/lib/tagsTableUI.js';

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

describe('TagsTableUI', () => {
  const meta = {
    '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
    '00200013': {vr: 'IS', value: ['3', '1', '2']}
  };
  const service = {
    getMetaData: () => meta
  };

  test('builds title, slider and table', () => {
    const [title, sliderDiv, scrollDiv] =
      new TagsTableUI(new TagsService(service), 'test').getContent();
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
    const [, sliderDiv, scrollDiv] =
      new TagsTableUI(new TagsService(service), 'test').getContent();
    const slider = sliderDiv.querySelector('input');
    slider.value = '2';
    slider.dispatchEvent(new Event('input'));
    expect(sliderDiv.querySelector('label').textContent).toBe('3');
    expect(scrollDiv.querySelector('table').textContent)
      .toContain('InstanceNumber3');
  });
});
