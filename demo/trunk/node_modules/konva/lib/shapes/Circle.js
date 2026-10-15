import { Factory } from "../Factory.js";
import { Shape } from "../Shape.js";
import { getNumberValidator } from "../Validators.js";
import { _registerNode } from "../Global.js";
/**
 * Circle constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.radius
 * @@shapeParams
 * @@nodeParams
 * @example
 * // create circle
 * var circle = new Konva.Circle({
 *   radius: 40,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5
 * });
 */
export class Circle extends Shape {
    _getStrokePadding() {
        return super._getStrokePadding(1);
    }
    _sceneFunc(context) {
        context.beginPath();
        context.arc(0, 0, Math.abs(this.attrs.radius || 0), 0, Math.PI * 2, false);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return Math.abs(this.radius()) * 2;
    }
    getHeight() {
        return Math.abs(this.radius()) * 2;
    }
    setWidth(width) {
        this.radius(width / 2);
    }
    setHeight(height) {
        this.radius(height / 2);
    }
}
Circle.prototype._centroid = true;
Circle.prototype.className = 'Circle';
Circle.prototype._attrsAffectingSize = ['radius'];
_registerNode(Circle, true);
/**
 * get/set radius
 * @name Konva.Circle#radius
 * @method
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radius
 * var radius = circle.radius();
 *
 * // set radius
 * circle.radius(10);
 */
Factory.addGetterSetter(Circle, 'radius', 0, getNumberValidator());
