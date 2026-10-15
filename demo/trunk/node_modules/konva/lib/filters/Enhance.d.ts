import type { Filter } from '../Node.ts';
/**
 * Enhance Filter. Adjusts the colors so that they span the widest
 *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
 *  writes.
 * @function
 * @name Enhance
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Enhance]);
 * node.enhance(0.4);
 */
export declare const Enhance: Filter;
