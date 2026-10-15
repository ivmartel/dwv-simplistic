import type { Filter } from '../Node.ts';
import './Brighten.ts';
/**
 * Brightness Filter.
 * CSS-compatible brightness multiplier. An unset brightness leaves pixels unchanged.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Brightness]);
 * node.brightness(1.5); // 50% brighter (CSS-compatible)
 */
export declare const Brightness: Filter;
