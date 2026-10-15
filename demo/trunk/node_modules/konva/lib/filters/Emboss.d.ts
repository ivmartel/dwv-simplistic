import type { Filter } from '../Node.ts';
/**
 * Emboss Filter.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Emboss]);
 * node.embossStrength(0.8);
 * node.embossWhiteLevel(0.3);
 * node.embossDirection('right');
 * node.embossBlend(true);
 */
export declare const Emboss: Filter;
/**
 * get/set emboss blend. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossBlend
 * @method
 * @param {Boolean} embossBlend
 * @returns {Boolean}
 */
