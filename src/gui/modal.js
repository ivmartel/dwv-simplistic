/**
 * Get the drop box HTML element.
 *
 * @param {string} appId The app id.
 * @returns {HTMLElement} Drop box element.
 */
export function getModalElement(appId) {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'modal-' + appId;
  modalDiv.className = 'modal';
  return modalDiv;
}

/**
 * Modal dialog class.
 */
export class Modal {

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
  #rootDoc = document;

  /**
   * @param {string} uid The GUI UID.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(uid, rootDoc) {
    this.#uid = uid;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Initialise the GUI.
   */
  init() {
    this.#setupUI();
  }

  /**
   * Setup the UI: bind app and panel actions.
   */
  #setupUI() {
    // content
    const contentDiv = document.createElement('div');
    contentDiv.id = 'modal-content-' + this.#uid;
    contentDiv.className = 'modal-content';
    contentDiv.style.width = '80%';
    contentDiv.style.height = '80%';
    contentDiv.style.margin = '5% auto';

    // main div
    const modalDiv = this.#rootDoc.getElementById(
      'modal-' + this.#uid
    );
    modalDiv.appendChild(contentDiv);

    // close on outside click
    this.#rootDoc.addEventListener('click', function (event) {
      if (event.target === modalDiv) {
        modalDiv.style.display = 'none';
      }
    });
  }

  /**
   * Open the modal with the given content.
   *
   * @param {HTMLElement[]} content The modal content.
   */
  open(content) {
    // show modal
    const modalDiv = this.#rootDoc.getElementById(
      'modal-' + this.#uid
    );
    modalDiv.style.display = 'block';

    // add elements from input
    const modalContentDiv = this.#rootDoc.getElementById(
      'modal-content-' + this.#uid
    );
    if (modalContentDiv && !modalContentDiv.hasChildNodes()) {
      for (const element of content) {
        modalContentDiv.appendChild(element);
      }
    }
  }
}