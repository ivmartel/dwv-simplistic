/**
 * Get the drop box HTML element.
 *
 * @param {string} viewerId The viewer id.
 * @returns {HTMLElement} Drop box element.
 */
export function getModalElement(viewerId) {
  const modalDiv = document.createElement('div');
  modalDiv.id = viewerId + '-modal';
  modalDiv.className = 'modal';
  return modalDiv;
}

/**
 * Modal dialog class.
 */
export class Modal {

  /**
   * The viewer id.
   *
   * @type {string}
   */
  #viewerId;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc;

  /**
   * @param {string} viewerId The viewer id.
   * @param {Document} rootDoc Root document.
   */
  constructor(viewerId, rootDoc) {
    this.#viewerId = viewerId;
    this.#rootDoc = rootDoc;
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
    contentDiv.id = this.#viewerId + '-modal-content';
    contentDiv.className = 'modal-content';

    // main div
    const modalDiv = this.#rootDoc.getElementById(
      this.#viewerId + '-modal'
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
      this.#viewerId + '-modal'
    );
    modalDiv.style.display = 'block';

    // add elements from input
    const modalContentDiv = this.#rootDoc.getElementById(
      this.#viewerId + '-modal-content'
    );
    if (modalContentDiv && !modalContentDiv.hasChildNodes()) {
      for (const element of content) {
        modalContentDiv.appendChild(element);
      }
    }
  }
}