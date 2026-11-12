/**
 * Default snackbar display duration in milliseconds.
 */
const defaultDuration = 4000;

/**
 * Show a message in a snackbar at the bottom of a container,
 *   removed after a delay. Showing a new message replaces the
 *   current one.
 *
 * @param {HTMLElement} container The container element.
 * @param {string} message The message.
 * @param {number} [duration] The display duration in milliseconds.
 * @returns {HTMLDivElement} The snackbar element.
 */
export function showSnackbar(container, message, duration) {
  container.querySelector(':scope > .snackbar')?.remove();

  const snackbar = document.createElement('div');
  snackbar.className = 'snackbar';
  snackbar.setAttribute('role', 'status');
  snackbar.appendChild(document.createTextNode(message));
  container.appendChild(snackbar);

  setTimeout(() => {
    snackbar.remove();
  }, duration ?? defaultDuration);

  return snackbar;
}
