import type { Filter } from '../Node.ts';
/**
 * Posterize Filter. Adjusts the channels so that there are no more
 *  than n different values for that channel. This is also applied
 *  to the alpha channel.
 * @function
 * @name Posterize
 * @author ippo615
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Posterize]);
 * node.levels(0.8); // between 0 and 1
 */
export declare const Posterize: Filter;
/**
 * get/set levels.  Must be a number between 0 and 1.  Use with {@link Konva.Filters.Posterize} filter.
 * @name Konva.Node#levels
 * @method
 * @param {Number} level between 0 and 1
 * @returns {Number}
 */
