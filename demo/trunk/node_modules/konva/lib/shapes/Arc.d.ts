import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet } from '../types.ts';
import type { Context } from '../Context.ts';
export interface ArcConfig extends ShapeConfig {
    angle: number;
    innerRadius: number;
    outerRadius: number;
    clockwise?: boolean;
}
/**
 * Arc constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.angle in degrees
 * @param {Number} config.innerRadius
 * @param {Number} config.outerRadius
 * @param {Boolean} [config.clockwise]
 * @@shapeParams
 * @@nodeParams
 * @example
 * // draw a Arc that's pointing downwards
 * var arc = new Konva.Arc({
 *   innerRadius: 40,
 *   outerRadius: 80,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5,
 *   angle: 60,
 *   rotation: -120
 * });
 */
export declare class Arc extends Shape<ArcConfig> {
    _sceneFunc(context: Context): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    getSelfRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    innerRadius: GetSet<number, this>;
    outerRadius: GetSet<number, this>;
    angle: GetSet<number, this>;
    clockwise: GetSet<boolean, this>;
}
/**
 * get/set clockwise flag
 * @name Konva.Arc#clockwise
 * @method
 * @param {Boolean} clockwise
 * @returns {Boolean}
 * @example
 * // get clockwise flag
 * var clockwise = arc.clockwise();
 *
 * // draw arc counter-clockwise
 * arc.clockwise(false);
 *
 * // draw arc clockwise
 * arc.clockwise(true);
 */
