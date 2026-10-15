import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet } from '../types.ts';
import type { Context } from '../Context.ts';
export interface CircleConfig extends ShapeConfig {
    radius?: number;
}
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
export declare class Circle extends Shape<CircleConfig> {
    _getStrokePadding(): number;
    _sceneFunc(context: Context): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    radius: GetSet<number, this>;
}
