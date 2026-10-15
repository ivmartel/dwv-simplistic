import { Factory } from "../Factory.js";
import { Shape } from "../Shape.js";
import { getNumberValidator } from "../Validators.js";
import { _registerNode } from "../Global.js";
const PIx2 = Math.PI * 2;
/**
 * Ring constructor
 * @constructor
 * @augments Konva.Shape
 * @memberof Konva
 * @param {Object} config
 * @param {Number} config.innerRadius
 * @param {Number} config.outerRadius
 * @@shapeParams
 * @@nodeParams
 * @example
 * var ring = new Konva.Ring({
 *   innerRadius: 40,
 *   outerRadius: 80,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5
 * });
 */
export class Ring extends Shape {
    _getStrokePadding() {
        return super._getStrokePadding(1);
    }
    _sceneFunc(context) {
        const innerRadius = Math.abs(this.innerRadius()), outerRadius = Math.abs(this.outerRadius());
        context.beginPath();
        context.arc(0, 0, innerRadius, 0, PIx2, false);
        context.moveTo(outerRadius, 0);
        context.arc(0, 0, outerRadius, PIx2, 0, true);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getSelfRect() {
        const radius = Math.max(Math.abs(this.innerRadius()), Math.abs(this.outerRadius()));
        return { x: -radius, y: -radius, width: radius * 2, height: radius * 2 };
    }
    getWidth() {
        return Math.abs(this.outerRadius()) * 2;
    }
    getHeight() {
        return Math.abs(this.outerRadius()) * 2;
    }
    setWidth(width) {
        this.outerRadius(width / 2);
    }
    setHeight(height) {
        this.outerRadius(height / 2);
    }
}
Ring.prototype.className = 'Ring';
Ring.prototype._centroid = true;
Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
_registerNode(Ring, true);
/**
 * get/set innerRadius
 * @method
 * @name Konva.Ring#innerRadius
 * @param {Number} innerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var innerRadius = ring.innerRadius();
 *
 * // set inner radius
 * ring.innerRadius(20);
 */
Factory.addGetterSetter(Ring, 'innerRadius', 0, getNumberValidator());
/**
 * get/set outerRadius
 * @name Konva.Ring#outerRadius
 * @method
 * @param {Number} outerRadius
 * @returns {Number}
 * @example
 * // get outer radius
 * var outerRadius = ring.outerRadius();
 *
 * // set outer radius
 * ring.outerRadius(20);
 */
Factory.addGetterSetter(Ring, 'outerRadius', 0, getNumberValidator());
