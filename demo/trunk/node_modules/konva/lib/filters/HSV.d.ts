import type { Filter } from '../Node.ts';
/**
 * HSV Filter. Adjusts the hue, saturation and value
 * @function
 * @name HSV
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * image.filters([Konva.Filters.HSV]);
 * image.value(1); // twice as bright
 */
export declare const HSV: Filter;
/**
 * get/set hsv value. Use with {@link Konva.Filters.HSV} filter.
 * @name Konva.Node#value
 * @method
 * @param {Number} value 0 is no change, -1.0 halves the value, 1.0 doubles, etc..
 * @returns {Number}
 */
