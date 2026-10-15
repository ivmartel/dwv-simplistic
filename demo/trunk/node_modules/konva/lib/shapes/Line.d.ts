import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { Context } from '../Context.ts';
import type { GetSet } from '../types.ts';
export type LinePoints = number[] | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export interface LineConfig extends ShapeConfig {
    points?: LinePoints;
    tension?: number;
    closed?: boolean;
    bezier?: boolean;
}
/**
 * Line constructor.&nbsp; Lines are defined by an array of points and
 *  a tension
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
 * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
 *   The default is 0
 * @param {Boolean} [config.closed] defines whether or not the line shape is closed, creating a polygon or blob
 * @param {Boolean} [config.bezier] if no tension is provided but bezier=true, we draw the line as a bezier using the passed points
 * @@shapeParams
 * @@nodeParams
 * @example
 * var line = new Konva.Line({
 *   x: 100,
 *   y: 50,
 *   points: [73, 70, 340, 23, 450, 60, 500, 20],
 *   stroke: 'red',
 *   tension: 1
 * });
 */
export declare class Line<Config extends LineConfig = LineConfig> extends Shape<Config> {
    constructor(config?: Config);
    _hasTension(): boolean;
    /**
     * Report every curve segment of a line with a tension, in draw order. Both
     * the scene function and the bounding rect read the shape through this, so
     * that they can not disagree about which curve the line is.
     *
     * The handlers take plain numbers, because this runs on every frame.
     */
    _eachTensionSegment(onQuadratic: (x0: number, y0: number, cpx: number, cpy: number, x: number, y: number) => void, onCubic: (x0: number, y0: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void): void;
    _getStrokePadding(miterLimit?: number | undefined): number;
    _sceneFunc(context: Context): void;
    getTensionPoints(): any;
    _getTensionPoints(): number[];
    _getTensionPointsClosed(): number[];
    getWidth(): number;
    getHeight(): number;
    getSelfRect(): import("../types.ts").IRect;
    closed: GetSet<boolean, this>;
    bezier: GetSet<boolean, this>;
    tension: GetSet<number, this>;
    points: GetSet<number[], this, LinePoints | null | undefined>;
}
/**
 * get/set points array. Points is a flat array [x1, y1, x2, y2]. It is flat for performance reasons.
 * @name Konva.Line#points
 * @method
 * @param {Array} points
 * @returns {Array}
 * @example
 * // get points
 * var points = line.points();
 *
 * // set points
 * line.points([10, 20, 30, 40, 50, 60]);
 *
 * // push a new point
 * line.points(line.points().concat([70, 80]));
 */
