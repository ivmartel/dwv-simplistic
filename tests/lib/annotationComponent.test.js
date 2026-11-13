import {describe, test, expect, vi, beforeEach} from 'vitest';

import {AnnotationComponent} from '../../src/lib/annotationComponent.js';
import {getIconElement} from '../../src/lib/icons.js';

/**
 * Get a mock annotation service with the given state.
 *
 * @param {object} state The initial state.
 * @returns {object} The mock service, with a `setState` helper.
 */
function getMockService(state) {
  const listeners = new Set();
  const service = {
    state,
    getSnapshot: () => service.state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState: (newState) => {
      service.state = newState;
      listeners.forEach((listener) => listener());
    },
    selectAnnotation: vi.fn(),
    gotoAnnotation: vi.fn(),
    setAnnotationGroupEditable: vi.fn(),
    setLabelsVisibility: vi.fn(),
    setAnnotationVisibility: vi.fn(),
    changeAnnotationColour: vi.fn(),
    deleteAnnotation: vi.fn(),
    getAnnotationGroupAsDicom: vi.fn()
  };
  return service;
}

/**
 * Get an annotation state.
 *
 * @param {object} [overrides] Properties to override.
 * @returns {object} The annotation state.
 */
function getAnnotation(overrides) {
  return {
    id: 'a0',
    label: 'ruler-0',
    colour: '#ffff80',
    factoryName: 'Ruler',
    canView: true,
    visible: true,
    quantification: {length: {value: 12.3456, unit: 'mm'}},
    ...overrides
  };
}

/**
 * Get a group state.
 *
 * @param {object[]} annotations The annotations.
 * @param {object} [overrides] Properties to override.
 * @returns {object} The group state.
 */
function getGroup(annotations, overrides) {
  return {
    dataId: '1',
    editable: true,
    labelsVisible: true,
    annotations,
    ...overrides
  };
}

/**
 * Render a component in a fresh panel.
 *
 * @param {object} state The service state.
 * @returns {object} The service and the panel element.
 */
function render(state) {
  document.body.innerHTML = '<div id="0-right-panel-content"></div>';
  const service = getMockService(state);
  const component = new AnnotationComponent(service, document, '0');
  component.registerListeners();
  return {service, component};
}

const rowId = '0-annotationgroup1-annotationa0';
/**
 * Get an annotation row element id.
 *
 * @param {string} type The element type.
 * @returns {string} The id.
 */
const rowElementId = (type) => `0-${type}-annotationgroup1-annotationa0`;

describe('AnnotationComponent', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  test('renders nothing without groups', () => {
    render({groups: [], selected: undefined});
    expect(document.getElementById('0-annotationgroup-list')).toBeNull();
  });

  test('renders an empty group', () => {
    const {service} = render({groups: [getGroup([])], selected: undefined});
    const empty = document.getElementById('0-annotationgroup1-empty');
    expect(empty.textContent).toBe('No annotation');
    expect(document.getElementById('addannotationgroupitem')).toBeNull();

    // removed when an annotation is added
    service.setState({
      groups: [getGroup([getAnnotation()])], selected: undefined
    });
    expect(document.getElementById('0-annotationgroup1-empty')).toBeNull();
    expect(document.getElementById(rowId)).not.toBeNull();
  });

  test('renders an annotation row', () => {
    const {service} = render({
      groups: [getGroup([getAnnotation()])], selected: undefined
    });
    const row = document.getElementById(rowId);
    const content = row.querySelector('button.data-item-list-item-content');
    expect(content.textContent).toBe('ruler-0');
    expect(content.querySelector('svg').innerHTML)
      .toBe(getIconElement('ruler').innerHTML);
    expect(row.querySelector('.not-viewable')).toBeNull();

    content.click();
    expect(service.selectAnnotation).toHaveBeenCalledWith('1', 'a0');
    expect(service.gotoAnnotation).toHaveBeenCalledWith('1', 'a0');
  });

  test('unknown shape and not viewable', () => {
    render({
      groups: [getGroup([
        getAnnotation({factoryName: 'unknown', canView: false})
      ])],
      selected: undefined
    });
    const row = document.getElementById(rowId);
    expect(row.querySelector('.shape-icon').innerHTML)
      .toBe(getIconElement('questionmark').innerHTML);
    expect(row.querySelector('.data-item-list-item-label')
      .classList.contains('not-viewable')).toBe(true);
  });

  test('toggle states and locked group', () => {
    render({
      groups: [getGroup([getAnnotation({visible: false})], {
        editable: false, labelsVisible: false
      })],
      selected: undefined
    });
    const pressed = (id) =>
      document.getElementById(id).getAttribute('aria-pressed');
    expect(pressed('0-lockb-annotationgroup1')).toBe('true');
    expect(pressed('0-hidelabelsb-annotationgroup1')).toBe('true');
    expect(pressed(rowElementId('vb'))).toBe('true');
    expect(pressed(rowElementId('ib'))).toBe('false');
    expect(document.getElementById(rowElementId('cb')).disabled).toBe(true);
    expect(document.getElementById(rowElementId('db')).disabled).toBe(true);
  });

  test('info toggles the quantification details', () => {
    render({groups: [getGroup([getAnnotation()])], selected: undefined});
    const info = document.getElementById(rowElementId('ib'));
    const details = document.getElementById(rowElementId('qd'));
    expect(info.getAttribute('aria-controls')).toBe(details.id);
    expect(details.hidden).toBe(true);

    info.click();
    expect(details.hidden).toBe(false);
    expect(info.getAttribute('aria-expanded')).toBe('true');
    expect(info.getAttribute('aria-pressed')).toBe('true');
    const pair = details.querySelector('dl div');
    expect(pair.title).toBe('length');
    expect(pair.querySelector('dt').textContent).toBe('length');
  });

  test('no quantification', () => {
    render({
      groups: [getGroup([getAnnotation({quantification: undefined})])],
      selected: undefined
    });
    document.getElementById(rowElementId('ib')).click();
    expect(document.getElementById(rowElementId('qd')).textContent)
      .toBe('No quantification');
  });

  test('selection is shown and scrolled into view', () => {
    const group = getGroup([getAnnotation()]);
    const {service} = render({groups: [group], selected: undefined});
    service.setState({
      groups: [group], selected: {dataId: '1', annotationId: 'a0'}
    });
    const row = document.getElementById(rowId);
    expect(row.classList.contains('selected')).toBe(true);
    expect(row.scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
  });

  test('save failure does not download', () => {
    const {service} = render({
      groups: [getGroup([getAnnotation()])], selected: undefined
    });
    service.getAnnotationGroupAsDicom.mockReturnValue(undefined);
    const createObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    document.querySelector('button[name="Save"]').click();
    expect(service.getAnnotationGroupAsDicom).toHaveBeenCalledWith('1');
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
