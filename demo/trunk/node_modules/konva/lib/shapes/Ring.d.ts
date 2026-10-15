import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet } from '../types.ts';
import type { Context } from '../Context.ts';
export interface RingConfig extends ShapeConfig {
    innerRadius: number;
    outerRadius: number;
}
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
export declare class Ring extends Shape<RingConfig> {
    _getStrokePadding(): number;
    _sceneFunc(context: Context): void;
    getSelfRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    outerRadius: GetSet<number, this>;
    innerRadius: GetSet<number, this>;
}
