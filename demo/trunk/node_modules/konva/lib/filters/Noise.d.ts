import type { Filter } from '../Node.ts';
/**
 * Noise Filter. Randomly adds or substracts to the color channels
 * @function
 * @name Noise
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Noise]);
 * node.noise(0.8);
 */
export declare const Noise: Filter;
/**
 * get/set noise amount.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Noise} filter.
 * @name Konva.Node#noise
 * @method
 * @param {Number} noise
 * @returns {Number}
 */
