import { Factory } from "../Factory.js";
import { Node } from "../Node.js";
// red, green and blue are registered there
import "./RGB.js";
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
export const RGBA = function (imageData) {
    const data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha();
    for (let i = 0; i < nPixels; i += 4) {
        const ia = 1 - alpha;
        data[i] = red * alpha + data[i] * ia; // r
        data[i + 1] = green * alpha + data[i + 1] * ia; // g
        data[i + 2] = blue * alpha + data[i + 2] * ia; // b
    }
};
Factory.addGetterSetter(Node, 'alpha', 1, (val) => Math.min(1, Math.max(0, val)), Factory.afterSetFilter);
/**
 * get/set filter alpha value. Use with {@link Konva.Filters.RGBA} filter.
 * @name alpha
 * @method
 * @memberof Konva.Node.prototype
 * @param {Float} alpha value between 0 and 1
 * @returns {Float}
 */
