import type { LineConfig } from './Line.ts';
import { Line } from './Line.ts';
import type { GetSet } from '../types.ts';
import type { Context } from '../Context.ts';
export interface ArrowConfig extends LineConfig {
    tension?: number;
    closed?: boolean;
    pointerLength?: number;
    pointerWidth?: number;
    pointerAtBeginning?: boolean;
    pointerAtEnding?: boolean;
}
/**
 * Arrow constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Line
 * @param {Object} config
 * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
 * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
 *   The default is 0
 * @param {Number} config.pointerLength Arrow pointer length. Default value is 10.
 * @param {Number} config.pointerWidth Arrow pointer width. Default value is 10.
 * @param {Boolean} config.pointerAtBeginning Do we need to draw pointer on beginning position?. Default false.
 * @param {Boolean} config.pointerAtEnding Do we need to draw pointer on ending position?. Default true.
 * @@shapeParams
 * @@nodeParams
 * @example
 * var line = new Konva.Line({
 *   points: [73, 70, 340, 23, 450, 60, 500, 20],
 *   stroke: 'red',
 *   tension: 1,
 *   pointerLength : 10,
 *   pointerWidth : 12
 * });
 */
export declare class Arrow extends Line<ArrowConfig> {
    _getStrokePadding(): number;
    _sceneFunc(ctx: Context): void;
    _getPointerAngle(atBeginning: boolean): number;
    __fillStroke(ctx: Context): void;
    getSelfRect(): import("../types.ts").IRect;
    pointerLength: GetSet<number, this>;
    pointerWidth: GetSet<number, this>;
    pointerAtEnding: GetSet<boolean, this>;
    pointerAtBeginning: GetSet<boolean, this>;
}
