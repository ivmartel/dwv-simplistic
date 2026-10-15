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
    app.getDataController().add('0', data);

    // update with command, as done by the annotation UI
    const drawController = new DrawController(annotationGroup);
    drawController.updateAnnotationWithCommand(
      'a0',
      {colour: '#ffff80'},
      {colour: '#ff0000'},
      service.addToUndoStack
    );
    expect(annotation.colour).toBe('#ff0000');
    app.getUndoController().undo();
    expect(annotation.colour).toBe('#ffff80');

    service.dispose();
    div.remove();
  });

  test('loadFromUri loads the urls of a key-value uri', () => {
    const div = document.createElement('div');
    div.id = 'layerGroup-uri';
    document.body.appendChild(div);
    const service = new DwvService({uid: 'uri', tools: ['Scroll']});
    const spy = vi.spyOn(service, 'loadURLs').mockImplementation(() => {});

    const input = 'https://example.com/file.dcm';
    service.loadFromUri(
      'https://viewer.com/index.html?input=' + encodeURIComponent(input));
    expect(spy).toHaveBeenCalledWith([input]);

    spy.mockClear();
    service.loadFromUri('https://viewer.com/index.html');
    expect(spy).not.toHaveBeenCalled();

    service.dispose();
    div.remove();
  });
});
