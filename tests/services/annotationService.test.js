import {describe, test, expect, vi} from 'vitest';
import {AnnotationService} from '../../src/services/annotationService.js';

/**
 * Get a mock annotation.
 *
 * @param {string} id The annotation tracking UID.
 * @param {object} [extra] Extra properties.
 * @returns {object} The annotation.
 */
function getAnnotation(id, extra) {
  return {
    trackingUid: id,
    trackingId: `label-${id}`,
    colour: '#ffff80',
    quantification: {surface: {value: 1, unit: 'mm2'}},
    getFactory: () => ({getName: () => 'Ruler'}),
    canView: () => true,
    getCentroid: () => undefined,
    ...extra
  };
}

/**
 * Mock annotation group.
 */
class MockAnnotationGroup extends EventTarget {
  #list;
  #editable = true;

  /**
   * @param {object[]} list The annotation list.
   */
  constructor(list) {
    super();
    this.#list = list;
  }

  /**
   * Get the annotation list.
   *
   * @returns {object[]} The list.
   */
  getList() {
    return this.#list;
  }

  /**
   * Find an annotation.
   *
   * @param {string} id The annotation tracking UID.
   * @returns {object|undefined} The annotation.
   */
  find(id) {
    return this.#list.find((item) => item.trackingUid === id);
  }

  /**
   * Get the editable flag.
   *
   * @returns {boolean} True if editable.
   */
  isEditable() {
    return this.#editable;
  }

  /**
   * Set the editable flag.
   *
   * @param {boolean} flag True to make editable.
   */
  setEditable(flag) {
    this.#editable = flag;
    this.dispatchEvent(new CustomEvent(
      'annotationgroupeditablechange', {detail: {data: flag}}));
  }
}

/**
 * Mock dwv app service.
 */
class MockDwvAppService extends EventTarget {
  data = new Map();
  drawLayer = {
    setLabelsVisibility: vi.fn(),
    setAnnotationVisibility: vi.fn()
  };
  viewLayer;
  createAnnotationData = vi.fn(() => ({id: 'new'}));
  addAndRenderAnnotationData = vi.fn();

  /**
   * Get the data controller.
   *
   * @returns {object} The controller.
   */
  getDataController() {
    return {get: (id) => this.data.get(id)};
  }

  /**
   * Get the stage controller.
   *
   * @returns {object} The controller.
   */
  getStageController() {
    return {
      getDrawLayersByDataId: () => [this.drawLayer],
      getLayerGroupByDivId: () => ({
        getActiveViewLayer: () => this.viewLayer
      })
    };
  }

  /**
   * Get the main layer group div id.
   *
   * @returns {string} The div id.
   */
  getMainLayerGroupDivId() {
    return 'layerGroup-0';
  }

  /**
   * Dispatch a custom event.
   *
   * @param {string} type The event type.
   * @param {object} detail The event detail.
   */
  fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {detail}));
  }
}

/**
 * Get a connected service with one annotation group.
 *
 * @returns {object} The mock dwv app service, annotation group
 *   and annotation service.
 */
function getConnectedService() {
  const dwvAppService = new MockDwvAppService();
  const group = new MockAnnotationGroup(
    [getAnnotation('a0'), getAnnotation('a1')]);
  dwvAppService.data.set('1', {annotationGroup: group});
  dwvAppService.data.set('0', {image: {}});
  const service = new AnnotationService(dwvAppService);
  service.connect();
  dwvAppService.fire('dataadd', {dataid: '0'});
  dwvAppService.fire('dataadd', {dataid: '1'});
  return {dwvAppService, group, service};
}

describe('AnnotationService', () => {

  test('starts with an empty state', () => {
    const service = new AnnotationService(new MockDwvAppService());
    expect(service.getSnapshot()).toEqual(
      {groups: [], selected: undefined});
  });

  test('adds annotation group data only', () => {
    const {service} = getConnectedService();
    const state = service.getSnapshot();
    expect(state.groups.length).toBe(1);
    const group = state.groups[0];
    expect(group.dataId).toBe('1');
    expect(group.editable).toBe(true);
    expect(group.labelsVisible).toBe(true);
    expect(group.annotations.map((item) => item.id)).toEqual(['a0', 'a1']);
    expect(group.annotations[0]).toEqual({
      id: 'a0',
      label: 'label-a0',
      colour: '#ffff80',
      factoryName: 'Ruler',
      canView: true,
      visible: true,
      quantification: {surface: {value: 1, unit: 'mm2'}}
    });
    // same snapshot while unchanged
    expect(service.getSnapshot()).toBe(state);
  });

  test('notifies subscribers until unsubscribed', () => {
    const {dwvAppService, service} = getConnectedService();
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    dwvAppService.fire('annotationadd',
      {dataid: '1', data: getAnnotation('a2')});
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    dwvAppService.fire('annotationadd',
      {dataid: '1', data: getAnnotation('a3')});
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('handles annotation add, update and remove', () => {
    const {dwvAppService, service} = getConnectedService();
    const before = service.getSnapshot().groups[0];

    dwvAppService.fire('annotationadd',
      {dataid: '1', data: getAnnotation('a2')});
    let group = service.getSnapshot().groups[0];
    expect(group.annotations.map((item) => item.id))
      .toEqual(['a0', 'a1', 'a2']);
    // unchanged annotations keep their identity
    expect(group.annotations[0]).toBe(before.annotations[0]);

    dwvAppService.fire('annotationupdate',
      {dataid: '1', data: getAnnotation('a1', {colour: '#000000'})});
    group = service.getSnapshot().groups[0];
    expect(group.annotations[1].colour).toBe('#000000');
    expect(group.annotations[0]).toBe(before.annotations[0]);

    dwvAppService.fire('annotationremove',
      {dataid: '1', data: getAnnotation('a0')});
    group = service.getSnapshot().groups[0];
    expect(group.annotations.map((item) => item.id)).toEqual(['a1', 'a2']);
  });

  test('handles selection', () => {
    const {dwvAppService, service} = getConnectedService();
    expect(service.selectAnnotation('1', 'unknown')).toBe(false);
    expect(service.getSnapshot().selected).toBeUndefined();

    expect(service.selectAnnotation('1', 'a1')).toBe(true);
    const state = service.getSnapshot();
    expect(state.selected).toEqual({dataId: '1', annotationId: 'a1'});
    // same selection does not change the state
    service.selectAnnotation('1', 'a1');
    expect(service.getSnapshot()).toBe(state);

    // tap on an annotation
    dwvAppService.fire('tap',
      {annotations: [{dataid: '1', annotationid: 'a0'}]});
    expect(service.getSnapshot().selected)
      .toEqual({dataId: '1', annotationId: 'a0'});
    // tap outside
    dwvAppService.fire('tap', {annotations: []});
    expect(service.getSnapshot().selected).toBeUndefined();

    // annotationselect
    dwvAppService.fire('annotationselect', {dataid: '1', annotationid: 'a1'});
    expect(service.getSnapshot().selected)
      .toEqual({dataId: '1', annotationId: 'a1'});
    // removing the selected annotation clears the selection
    dwvAppService.fire('annotationremove',
      {dataid: '1', data: getAnnotation('a1')});
    expect(service.getSnapshot().selected).toBeUndefined();
  });

  test('follows the group editable state', () => {
    const {dwvAppService, group, service} = getConnectedService();
    service.setAnnotationGroupEditable('1', false);
    expect(service.getSnapshot().groups[0].editable).toBe(false);

    // no more listening once the data is removed
    dwvAppService.fire('dataremove', {dataid: '1'});
    expect(service.getSnapshot().groups).toEqual([]);
    const state = service.getSnapshot();
    group.setEditable(true);
    expect(service.getSnapshot()).toBe(state);
  });

  test('sets labels and annotation visibility', () => {
    const {dwvAppService, service} = getConnectedService();
    expect(service.setLabelsVisibility('1', false)).toBe(true);
    expect(dwvAppService.drawLayer.setLabelsVisibility)
      .toHaveBeenCalledWith(false);
    expect(service.getSnapshot().groups[0].labelsVisible).toBe(false);

    service.setAnnotationVisibility('1', 'a1', false);
    expect(dwvAppService.drawLayer.setAnnotationVisibility)
      .toHaveBeenCalledWith('a1', false);
    const annotations = service.getSnapshot().groups[0].annotations;
    expect(annotations[1].visible).toBe(false);
    expect(annotations[0].visible).toBe(true);

    // visibility is kept on update
    dwvAppService.fire('annotationupdate',
      {dataid: '1', data: getAnnotation('a1')});
    expect(service.getSnapshot().groups[0].annotations[1].visible)
      .toBe(false);
  });

  test('adds an annotation group on the active view layer', () => {
    const {dwvAppService, service} = getConnectedService();
    expect(service.addAnnotationGroup()).toBe(false);
    expect(dwvAppService.createAnnotationData).not.toHaveBeenCalled();

    dwvAppService.viewLayer = {getDataId: () => '0'};
    expect(service.getDefaultGroupReference())
      .toEqual({refDataId: '0', divId: 'layerGroup-0'});
    expect(service.addAnnotationGroup()).toBe(true);
    expect(dwvAppService.createAnnotationData).toHaveBeenCalledWith('0');
    expect(dwvAppService.addAndRenderAnnotationData)
      .toHaveBeenCalledWith({id: 'new'}, 'layerGroup-0', '0');
  });

  test('throws when saving an unknown group', () => {
    const {service} = getConnectedService();
    expect(() => service.getAnnotationGroupAsDicom('unknown')).toThrow();
  });

  test('stops listening on dispose', () => {
    const {dwvAppService, service} = getConnectedService();
    const listener = vi.fn();
    service.subscribe(listener);
    service.dispose();
    const state = service.getSnapshot();
    dwvAppService.fire('annotationadd',
      {dataid: '1', data: getAnnotation('a2')});
    expect(service.getSnapshot()).toBe(state);
    expect(listener).not.toHaveBeenCalled();
  });

});
