import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { Context } from '../Context.ts';
import type { GetSet, Vector2d } from '../types.ts';
export interface EllipseConfig extends ShapeConfig {
    radius?: Vector2d;
    radiusX?: number;
    radiusY?: number;
}
/**
 * Ellipse constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Object} config.radius defines x and y radius
 * @@shapeParams
 * @@nodeParams
 * @example
 * var ellipse = new Konva.Ellipse({
 *   radius : {
 *     x : 50,
 *     y : 50
 *   },
 *   fill: 'red'
 * });
 */
export declare class Ellipse extends Shape<EllipseConfig> {
    _getStrokePadding(): number;
    _sceneFunc(context: Context): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    radius: GetSet<Vector2d, this>;
    radiusX: GetSet<number, this>;
    radiusY: GetSet<number, this>;
}
/**
 * get/set radius y
 * @name Konva.Ellipse#radiusY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get radius y
 * var radiusY = ellipse.radiusY();
 *
 * // set radius y
 * ellipse.radiusY(200);
 */
