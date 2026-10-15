import type { Filter } from '../Node.ts';
import './RGB.ts';
/**
 * RGBA Filter
 * @function
 * @name RGBA
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author codefo
 * @example
 * node.cache();
 * node.filters([Konva.Filters.RGBA]);
 * node.blue(120);
 * node.green(200);
 * node.alpha(0.3);
 */
export declare const RGBA: Filter;
/**
 * get/set filter alpha value. Use with {@link Konva.Filters.RGBA} filter.
 * @name alpha
 * @method
 * @memberof Konva.Node.prototype
 * @param {Float} alpha value between 0 and 1
 * @returns {Float}
 */
