import type { Filter } from '../Node.ts';
/**
 * get/set hsl luminance. Use with {@link Konva.Filters.HSL} filter.
 * @name Konva.Node#luminance
 * @method
 * @param {Number} value from -1 to 1
 * @returns {Number}
 */
/**
 * HSL Filter. Adjusts the hue, saturation and luminance (or lightness)
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * image.filters([Konva.Filters.HSL]);
 * image.luminance(0.2);
 */
export declare const HSL: Filter;
