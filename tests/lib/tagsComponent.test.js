import {describe, test, expect} from 'vitest';

import {TagsService} from '../../src/lib/tagsService.js';
import {
  TagsComponent,
  arrayToHtmlTable
} from '../../src/lib/tagsComponent.js';

/**
 * Get a connected tags service and component.
 *
 * @param {object} meta The meta data.
 * @returns {object} The fake app service, tags service and component.
 */
function setup(meta) {
  const service = new EventTarget();
  service.getMetaData = () => meta;
  const tagsService = new TagsService(service);
  tagsService.connect();
  const component = new TagsComponent(tagsService, 'test');
  component.registerListeners();
  return {service, tagsService, component};
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

const meta = {
  '00020010': {vr: 'UI', value: ['1.2.840.10008.1.2.1']},
  '00200013': {vr: 'IS', value: ['3', '1', '2']}
};

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

describe('TagsComponent', () => {
  test('returns the same content elements', () => {
    const {component} = setup(meta);
    const content = component.getContent();
    expect(content.length).toBe(3);
    expect(content[0].textContent).toBe('DICOM Tags');
    expect(component.getContent()).toBe(content);
  });

  test('renders the loaded state', () => {
    const {service, component} = setup(meta);
    const [, sliderDiv, scrollDiv] = component.getContent();
    dispatchDataLoaded(service, true);
    const slider = sliderDiv.querySelector('input');
    expect(slider.id).toBe('instancenumber-slider-test');
    expect(slider.max).toBe('2');
    expect(sliderDiv.style.display).toBe('');
    expect(sliderDiv.querySelector('label').textContent).toBe('1');
    expect(scrollDiv.textContent).toContain('InstanceNumber1');
  });

  test('renders a state loaded before the first content request', () => {
    const {service, component} = setup(meta);
    dispatchDataLoaded(service, true);
    const [, , scrollDiv] = component.getContent();
    expect(scrollDiv.textContent).toContain('InstanceNumber1');
  });

  test('selects the instance number on slider input', () => {
    const {service, tagsService, component} = setup(meta);
    const [, sliderDiv, scrollDiv] = component.getContent();
    dispatchDataLoaded(service, true);
    const slider = sliderDiv.querySelector('input');
    slider.value = '2';
    slider.dispatchEvent(new Event('input'));
    expect(tagsService.getSnapshot().instanceNumber).toBe(3);
    expect(sliderDiv.querySelector('label').textContent).toBe('3');
    expect(scrollDiv.textContent).toContain('InstanceNumber3');
  });

  test('hides the slider without instance number', () => {
    const {service, component} = setup({width: {value: 512}});
    const [, sliderDiv, scrollDiv] = component.getContent();
    dispatchDataLoaded(service, true);
    expect(sliderDiv.style.display).toBe('none');
    expect(scrollDiv.textContent).toContain('width512');
  });

  test('stops rendering on dispose', () => {
    const {service, component} = setup(meta);
    const [, , scrollDiv] = component.getContent();
    component.dispose();
    dispatchDataLoaded(service, true);
    expect(scrollDiv.textContent).toBe('Empty input array...');
  });
});
