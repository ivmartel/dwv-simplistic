import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  App,
  Annotation,
  AnnotationGroup,
  DicomData,
  Point2D,
  Rectangle
} from 'dwv';
import {DwvService} from '../src/dwv.service.js';

/**
 * Create a service and get its underlying dwv app.
 *
 * @param {string} uid The service uid.
 * @returns {object} The service, dwv app and layer group div.
 */
function createService(uid) {
  const div = document.createElement('div');
  div.id = 'layerGroup-' + uid;
  document.body.appendChild(div);
  const initSpy = vi.spyOn(App.prototype, 'init');
  // only scroll: jsdom has no canvas (needed by the draw tool)
  const service = new DwvService({uid, tools: ['Scroll']});
  const app = initSpy.mock.contexts[0];
  initSpy.mockRestore();
  return {service, app, div};
}

/**
 * Create an annotation.
 *
 * @param {string} uid The annotation tracking uid.
 * @returns {Annotation} The annotation.
 */
function createAnnotation(uid) {
  const annotation = new Annotation();
  annotation.trackingUid = uid;
  annotation.trackingId = 'annot-' + uid;
  annotation.colour = '#ffff80';
  annotation.mathShape = new Rectangle(new Point2D(0, 0), new Point2D(1, 1));
  annotation.referencedSopInstanceUID = '1.2.3';
  annotation.referencedSopClassUID = '1.2.840.10008.5.1.4.1.1.2';
  return annotation;
}

describe('DwvService', () => {
  test('dispose removes the window listeners', () => {
    const {service, div} = createService('dispose');

    const spy = vi.spyOn(window, 'removeEventListener');
    service.dispose();
    const types = spy.mock.calls.map((call) => call[0]);
    expect(types).toContain('resize');
    expect(types).toContain('keydown');

    spy.mockRestore();
    div.remove();
  });
});

describe('DwvService annotations', () => {
  const dataId = '0';
  let service;
  let app;
  let div;
  let annotationGroup;

  beforeEach(() => {
    ({service, app, div} = createService('annot'));
    annotationGroup = new AnnotationGroup([
      createAnnotation('a0'),
      createAnnotation('a1')
    ]);
    // as set by App.createAnnotationData, needed by the DICOM SR writer
    annotationGroup.setMetaValue('Modality', 'SR');
    annotationGroup.setMetaValue(
      'CurrentRequestedProcedureEvidenceSequence', {
        value: [{
          ReferencedSeriesSequence: {
            value: [{SeriesInstanceUID: '1.2.3.4'}]
          },
          StudyInstanceUID: '1.2.3'
        }]
      }
    );
    const data = new DicomData({});
    data.annotationGroup = annotationGroup;
    app.addData(dataId, data);
  });

  afterEach(() => {
    service.dispose();
    div.remove();
  });

  test('getAnnotations', () => {
    expect(service.getAnnotations(dataId)).toEqual(
      annotationGroup.getList());
    expect(service.getAnnotations('unknown')).toBeUndefined();

    const imageData = new DicomData({});
    imageData.image = new EventTarget();
    app.addData('1', imageData);
    expect(service.getAnnotations('1')).toBeUndefined();
  });

  test('setAnnotationColour is undoable', () => {
    const annotation = annotationGroup.find('a0');
    service.setAnnotationColour(dataId, 'a0', '#ff0000');
    expect(annotation.colour).toBe('#ff0000');
    app.undo();
    expect(annotation.colour).toBe('#ffff80');
  });

  test('setAnnotationColour with same colour adds no command', () => {
    const spy = vi.spyOn(app, 'addToUndoStack');
    service.setAnnotationColour(dataId, 'a0', '#ffff80');
    expect(spy).not.toHaveBeenCalled();
  });

  test('removeAnnotation is undoable', () => {
    service.removeAnnotation(dataId, 'a0');
    expect(annotationGroup.find('a0')).toBeUndefined();
    expect(annotationGroup.getLength()).toBe(1);
    app.undo();
    expect(annotationGroup.find('a0')).toBeDefined();
  });

  test('setAnnotationGroupEditable', () => {
    const events = [];
    service.addEventListener('annotationgroupeditablechange',
      (event) => events.push(event.detail));

    expect(service.isAnnotationGroupEditable(dataId)).toBe(true);
    service.setAnnotationGroupEditable(dataId, false);
    expect(service.isAnnotationGroupEditable(dataId)).toBe(false);
    expect(events).toEqual([{dataid: dataId, value: false}]);

    expect(service.isAnnotationGroupEditable('unknown')).toBe(false);
  });

  test('getAnnotationGroupAsDicom', () => {
    const buffer = service.getAnnotationGroupAsDicom(dataId);
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(() => service.getAnnotationGroupAsDicom('unknown')).toThrow();
  });
});
