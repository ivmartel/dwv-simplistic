import {describe, test, expect, vi} from 'vitest';
import {
  App,
  Annotation,
  AnnotationGroup,
  DicomData,
  DrawController
} from 'dwv';
import {DwvService} from '../src/dwv.service.js';

describe('DwvService', () => {
  test('dispose removes the window listeners', () => {
    const div = document.createElement('div');
    div.id = 'layerGroup-dispose';
    document.body.appendChild(div);
    // only scroll: jsdom has no canvas (needed by the draw tool)
    const service = new DwvService({uid: 'dispose', tools: ['Scroll']});

    const spy = vi.spyOn(window, 'removeEventListener');
    service.dispose();
    const types = spy.mock.calls.map((call) => call[0]);
    expect(types).toContain('resize');
    expect(types).toContain('keydown');

    spy.mockRestore();
    div.remove();
  });

  test('addToUndoStack makes annotation commands undoable', () => {
    const div = document.createElement('div');
    div.id = 'layerGroup-undo';
    document.body.appendChild(div);
    // get the service dwv app
    const initSpy = vi.spyOn(App.prototype, 'init');
    const service = new DwvService({uid: 'undo', tools: ['Scroll']});
    const app = initSpy.mock.contexts[0];
    initSpy.mockRestore();

    // annotation data
    const annotation = new Annotation();
    annotation.trackingUid = 'a0';
    annotation.colour = '#ffff80';
    const annotationGroup = new AnnotationGroup([annotation]);
    const data = new DicomData({});
    data.annotationGroup = annotationGroup;
    app.addData('0', data);

    // update with command, as done by the annotation UI
    const drawController = new DrawController(annotationGroup);
    drawController.updateAnnotationWithCommand(
      'a0',
      {colour: '#ffff80'},
      {colour: '#ff0000'},
      service.addToUndoStack
    );
    expect(annotation.colour).toBe('#ff0000');
    app.undo();
    expect(annotation.colour).toBe('#ffff80');

    service.dispose();
    div.remove();
  });
});
