import {
  AnnotationGroupFactory,
  DicomWriter,
  DrawController,
  getUID
} from 'dwv';
import {
  getIconElement,
  getButton,
  setButtonPressed,
  isButtonPressed
} from './icons.js';

// doc imports
/* eslint-disable no-unused-vars */
import {
  Annotation,
  AnnotationGroup,
} from 'dwv';
import {DwvService} from '../dwv.service.js';
/* eslint-enable no-unused-vars */

/**
 * Get the annotation group divId.
 *
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationGroupDivId(dataId) {
  return 'annotationgroup' + dataId;
}

/**
 * Get the annotation divId.
 *
 * @param {Annotation} annotation The annotation.
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationDivId(annotation, dataId) {
  const prefix = getAnnotationGroupDivId(dataId);
  const suffix = 'annotation' + annotation.trackingUid;
  return prefix + '-' + suffix;
}

/**
 * Split a divId to get dataId and annotationId.
 *
 * @param {string} divId The divId.
 * @returns {object} The data and annotation ID.
 */
function splitAnnotationDivId(divId) {
  const split = divId.split('-');
  const prefixStrSize = 'annotationgroup'.length;
  const suffixStrSize = 'annotation'.length;
  return {
    dataId: split[0].substring(prefixStrSize),
    annotationId: split[1].substring(suffixStrSize)
  };
}

/**
 * Annotation UI.
 */
export class AnnotationUI {

  /**
   * The dwv service.
   *
   * @type {DwvService}
   */
  #dwvService;

  /**
   * The GUI UID.
   *
   * @type {string}
   */
  #uid;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc;

  /**
   * @param {DwvService} dwvService The dwv service.
   */
  constructor(dwvService) {
    this.#dwvService = dwvService;
    this.#uid = dwvService.getOptions().uid;
    this.#rootDoc = dwvService.getOptions().rootDocument;
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    this.#dwvService.addEventListener('dataadd',
      this.#onDataAdd);
    this.#dwvService.addEventListener('drawlayeradd',
      this.#onDrawLayerAdd);
    this.#dwvService.addEventListener('annotationadd',
      this.#onAnnotationAdd);
    this.#dwvService.addEventListener('annotationupdate',
      this.#onAnnotationUpdate);
    this.#dwvService.addEventListener('annotationremove',
      this.#onAnnotationRemove);
  };

  /**
   * Get the container div.
   *
   * @returns {HTMLDivElement} The element.
   */
  #getContainerDiv() {
    return this.#rootDoc.getElementById('right-panel-content-' + this.#uid);
  }

  /**
   * Setup the html for the annotation list.
   */
  #setupHtml() {
    // add annotation group button
    const addItem = document.createElement('li');
    addItem.id = 'addannotationgroupitem';
    const addAnnotationGroupButton = document.createElement('button');
    addAnnotationGroupButton.appendChild(
      document.createTextNode('Add annotation group'));
    addAnnotationGroupButton.onclick = () => {
      // will trigger a dataadd event
      this.#dwvService.addAnnotationGroup();
    };
    addItem.appendChild(addAnnotationGroupButton);

    // annotation list
    const annotList = document.createElement('ul');
    annotList.id = 'annotationgroup-list';
    annotList.className = 'data-list';
    annotList.appendChild(addItem);

    // setup and append
    this.#getContainerDiv().appendChild(annotList);
  }

  /**
   * Get the annotation html.
   *
   * @param {Annotation} annotation The annotation.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLLIElement} The HTMl element.
   */
  #getAnnotationHtml(annotation, dataId) {
    const annotationDivId = getAnnotationDivId(annotation, dataId);

    const inputColour = document.createElement('input');
    inputColour.type = 'color';
    inputColour.title = 'Change annotation colour';
    const inputColourPrefix = 'cb-';
    inputColour.id = inputColourPrefix + annotationDivId;
    inputColour.value = annotation.colour;
    inputColour.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };
    inputColour.onchange = (event) => {
      const target = event.target;
      const newColour = target.value;
      // get annotation
      const indices =
        splitAnnotationDivId(target.id.substring(inputColourPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = this.#dwvService.getData(dataId).annotationGroup;
      const annotation = annotationGroup.find(annotationId);
      // update
      if (newColour !== annotation.colour) {
        const drawController = new DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annotationId,
          {colour: annotation.colour},
          {colour: newColour},
          this.#dwvService.addToUndoStack
        );
      }
    };

    const viewButton = getButton('View');
    setButtonPressed(viewButton, false);
    const vbIdPrefix = 'vb-';
    viewButton.id = vbIdPrefix + annotationDivId;
    viewButton.title = 'Show/hide annotation';
    viewButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      const target = event.target;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(vbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      // toggle view
      const isPressed = isButtonPressed(target);
      setButtonPressed(target, !isPressed);
      this.#dwvService.setAnnotationVisibility(dataId, annotationId, isPressed);
    };

    const deleteButton = getButton('Delete');
    const dbIdPrefix = 'db-';
    deleteButton.id = dbIdPrefix + annotationDivId;
    deleteButton.title = 'Delete annotation';
    deleteButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      const target = event.target;
      // get segment and mask
      const indices =
        splitAnnotationDivId(target.id.substring(dbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      // delete if possible
      const drawController = new DrawController(
        this.#dwvService.getData(dataId).annotationGroup);
      // TODO reposition div at same position after delete undo?
      drawController.removeAnnotationWithCommand(
        annotationId,
        this.#dwvService.addToUndoStack
      );
    };

    // disable/enable buttons if group is editable or not
    const annotationGroup = this.#dwvService.getData(dataId).annotationGroup;
    annotationGroup.addEventListener(
      'annotationgroupeditablechange', function (event) {
        const disabled = !event.data;
        inputColour.disabled = disabled;
        deleteButton.disabled = disabled;
      }
    );

    // content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'data-item-list-item-content';
    let factoryName = 'unknown';
    if (typeof annotation.getFactory() !== 'undefined') {
      factoryName = annotation.getFactory().getName();
    }
    contentDiv.appendChild(getIconElement(factoryName));
    contentDiv.appendChild(document.createTextNode(
      ' ' + annotation.trackingId));

    // actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'data-item-list-item-actions';
    actionsDiv.appendChild(viewButton);
    actionsDiv.appendChild(inputColour);
    actionsDiv.appendChild(deleteButton);

    // list item
    const item = document.createElement('li');
    item.id = annotationDivId;
    item.className = 'data-item-list-item';
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);

    // click on li to go to annotation
    item.addEventListener('click', (event) => {
      const target = event.currentTarget;

      // remove selected class from other rows
      const mainlist = this.#rootDoc.getElementById('annotationgroup-list');
      const items = mainlist.querySelectorAll('.data-item-list-item');
      items.forEach(item => item.classList.remove('selected'));
      // mark this row as selected
      target.classList.add('selected');

      // goto annotation
      const indices = splitAnnotationDivId(target.id);
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      this.#dwvService.goToAnnotation(dataId, annotationId);
    });

    return item;
  }

  /**
   * Get an annotation group html.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLIement} The annotation list element.
   */
  #getAnnotationGroupHtml(annotationGroup, dataId) {
    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = getAnnotationGroupDivId(dataId) + '-name';
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode('group #' + dataId));

    // lock button
    const lockButton = getButton('Lock');
    setButtonPressed(lockButton, false);
    lockButton.id = 'lockb-' + getAnnotationGroupDivId(dataId);
    lockButton.onclick = function (event) {
      const target = event.target;
      // toggle hidden
      const isPressed = isButtonPressed(target);
      setButtonPressed(target, !isPressed);
      if (typeof annotationGroup !== 'undefined') {
        annotationGroup.setEditable(isPressed);
      }
    };

    // save button
    const saveButton = getButton('Save');
    saveButton.title = 'Save annnotation group';
    saveButton.onclick = function () {
      const factory = new AnnotationGroupFactory();
      const sopUID = getUID('SOPInstanceUID');
      const extraTags = {
        MediaStorageSOPInstanceUID: sopUID,
        SOPInstanceUID: sopUID,
        InstanceNumber: 123,
        SeriesInstanceUID: getUID('SeriesInstanceUID'),
        SeriesNumber: 123,
        SeriesDescription: 'Annnotation made with dwv',
      };
      const dicomElements = factory.toDicom(annotationGroup, extraTags);
      // write
      const writer = new DicomWriter();
      let dicomBuffer = null;
      try {
        dicomBuffer = writer.getBuffer(dicomElements);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
      const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
      saveButton.href = window.URL.createObjectURL(blob);

      // temporary link to download
      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(blob);
      element.download = 'dicom-sr-' + dataId + '.dcm';
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    };

    // hide button
    const hideLabelsButton = getButton('Label');
    setButtonPressed(hideLabelsButton, false);
    hideLabelsButton.id = 'b-hidelabels';
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.onclick = (event) => {
      const target = event.target;
      // toggle hide
      const isPressed = isButtonPressed(target);
      setButtonPressed(target, !isPressed);
      this.#dwvService.setAnnotationLabelsVisibility(dataId, isPressed);
    };

    // actions
    const actionGroupDiv = document.createElement('div');
    actionGroupDiv.id = getAnnotationGroupDivId(dataId) + '-actions';
    actionGroupDiv.className = 'data-item-actions';
    actionGroupDiv.appendChild(lockButton);
    actionGroupDiv.appendChild(saveButton);
    actionGroupDiv.appendChild(hideLabelsButton);

    // annotation list
    const listDiv = document.createElement('ul');
    listDiv.id = getAnnotationGroupDivId(dataId) + '-list';
    listDiv.className = 'data-item-list';
    for (const annotation of annotationGroup.getList()) {
      listDiv.appendChild(this.#getAnnotationHtml(annotation, dataId));
    }

    // data-item-header
    const headerDiv = document.createElement('div');
    headerDiv.id = getAnnotationGroupDivId(dataId) + '-header';
    headerDiv.className = 'data-item-header';
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(actionGroupDiv);

    // data-item-content
    const contentDiv = document.createElement('div');
    contentDiv.id = getAnnotationGroupDivId(dataId) + '-content';
    contentDiv.className = 'data-item-content';
    contentDiv.appendChild(listDiv);

    // data-item
    const item = document.createElement('li');
    item.id = getAnnotationGroupDivId(dataId);
    item.className = 'data-item';
    item.appendChild(headerDiv);
    item.appendChild(contentDiv);

    return item;
  };

  /**
   * Handle 'dataadd' event.
   *
   * @param {object} event The event.
   */
  #onDataAdd = (event) => {
    const dataId = event.detail.dataid;
    const data = this.#dwvService.getData(dataId);
    const ag = data.annotationGroup;
    if (typeof ag !== 'undefined') {
      // setup html if needed
      if (!this.#rootDoc.getElementById('annotationgroup-list')) {
        this.#setupHtml();
      }
      // annotation group as html
      const item = this.#getAnnotationGroupHtml(ag, dataId);
      // add annotation group item
      const addItem = this.#rootDoc.getElementById('addannotationgroupitem');
      // remove and add after to make it last item
      addItem.remove();

      // update list
      const annotList = this.#rootDoc.getElementById('annotationgroup-list');
      annotList.appendChild(item);
      annotList.appendChild(addItem);
    }
  };

  /**
   * Handle 'drawlayeradd' event.
   *
   * @param {object} event The event.
   */
  #onDrawLayerAdd = (event) => {
    const dataId = event.detail.dataid;
    const annotationGroup = this.#dwvService.getData(dataId).annotationGroup;
    // strike through non viewable annotations
    for (const annotation of annotationGroup.getList()) {
      let textDecoration = '';
      if (!annotation.canView()) {
        textDecoration = 'line-through';
      }
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      const item = this.#rootDoc.getElementById(annotationDivId);
      if (item) {
        item.style['text-decoration-line'] = textDecoration;
      }
    }
  };

  /**
   * Handle 'annotationadd' event.
   *
   * @param {object} event The event.
   */
  #onAnnotationAdd = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    // add item to list
    const listDivId = getAnnotationGroupDivId(dataId) + '-list';
    const listDiv = this.#rootDoc.getElementById(listDivId);
    listDiv.appendChild(this.#getAnnotationHtml(annotation, dataId));
  };

  /**
   * Handle 'annotationupdate' event.
   *
   * @param {object} event The event.
   */
  #onAnnotationUpdate = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    const keys = event.detail.keys;

    if (typeof keys !== 'undefined') {
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      // update colour input
      if (keys.includes('colour')) {
        const inputColour = this.#rootDoc.getElementById(
          'cb-' + annotationDivId);
        inputColour.value = annotation.colour;
      }
    }
  };

  /**
   * Handle 'annotationremove' event.
   *
   * @param {object} event The event.
   */
  #onAnnotationRemove = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    // remove annotation from list
    const annotationDivId = getAnnotationDivId(annotation, dataId);
    const item = this.#rootDoc.getElementById(annotationDivId);
    item.remove();
  };

}; // AnnotationUI
