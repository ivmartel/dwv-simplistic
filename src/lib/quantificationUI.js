/**
 * @import {QuantificationGroup} from './quantification.js';
 */

/**
 * Note: highly inspired from the dwv viewer
 *   and 'dev/viewer/src/quantificationUI.js'
 *   (rendering part, logic in './quantification.js').
 */

/**
 * Render quantification groups in a details element.
 *
 * @param {HTMLDivElement} detailsDiv The details element.
 * @param {QuantificationGroup[]} groups The quantification groups.
 */
export function renderQuantification(detailsDiv, groups) {
  if (groups.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'quantification-empty';
    emptyDiv.appendChild(document.createTextNode('No quantification'));
    detailsDiv.replaceChildren(emptyDiv);
    return;
  }
  const elements = [];
  for (const group of groups) {
    const title = document.createElement('div');
    title.className = 'quantification-title';
    title.appendChild(document.createTextNode(group.title));
    const list = document.createElement('dl');
    list.className = 'quantification';
    for (const item of group.items) {
      // short label, full label in the tooltip
      const term = document.createElement('dt');
      term.appendChild(document.createTextNode(item.shortLabel));
      const value = document.createElement('dd');
      value.appendChild(document.createTextNode(item.value));
      // wrap pair to allow several per line
      const pair = document.createElement('div');
      pair.title = item.label;
      pair.appendChild(term);
      pair.appendChild(value);
      list.appendChild(pair);
    }
    const groupDiv = document.createElement('div');
    groupDiv.className = 'quantification-group';
    groupDiv.appendChild(title);
    groupDiv.appendChild(list);
    elements.push(groupDiv);
  }
  detailsDiv.replaceChildren(...elements);
}
