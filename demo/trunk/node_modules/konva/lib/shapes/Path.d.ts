import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet, PathSegment } from '../types.ts';
export interface PathConfig extends ShapeConfig {
    data?: string;
}
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} config.data SVG data string
 * @@shapeParams
 * @@nodeParams
 * @example
 * var path = new Konva.Path({
 *   x: 240,
 *   y: 40,
 *   data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
 *   fill: 'green',
 *   scaleX: 2,
 *   scaleY: 2
 * });
 */
export declare class Path extends Shape<PathConfig> {
    dataArray: PathSegment[];
    pathLength: number;
    constructor(config?: PathConfig);
    _readDataAttribute(): void;
    _sceneFunc(context: any): void;
    getWidth(): number;
    getHeight(): number;
    getSelfRect(): import("../types.ts").IRect;
    /**
     * Return length of the path.
     * @method
     * @name Konva.Path#getLength
     * @returns {Number} length
     * @example
     * var length = path.getLength();
     */
    getLength(): number;
    /**
     * Get point on path at specific length of the path
     * @method
     * @name Konva.Path#getPointAtLength
     * @param {Number} length length
     * @returns {Object} point {x,y} point
     * @example
     * var point = path.getPointAtLength(10);
     */
    getPointAtLength(length: number): {
        x: number;
        y: number;
    } | null;
    data: GetSet<string, this>;
    static getLineLength(x1: any, y1: any, x2: any, y2: any): number;
    static getPathLength(dataArray: PathSegment[]): number;
    static getPointAtLengthOfDataArray(length: number, dataArray: PathSegment[], cursor?: {
        index: number;
        offset: number;
    }): {
        x: number;
        y: number;
    } | null;
    static getPointOnLine(dist: number, P1x: number, P1y: number, P2x: number, P2y: number, fromX?: number, fromY?: number): {
        x: number;
        y: number;
    };
    static getPointOnCubicBezier(pct: number, P1x: number, P1y: number, P2x: number, P2y: number, P3x: number, P3y: number, P4x: number, P4y: number): {
        x: number;
        y: number;
    };
    static getPointOnQuadraticBezier(pct: any, P1x: any, P1y: any, P2x: any, P2y: any, P3x: any, P3y: any): {
        x: number;
        y: number;
    };
    static getPointOnEllipticalArc(cx: number, cy: number, rx: number, ry: number, theta: number, psi: number): {
        x: number;
        y: number;
    };
    static parsePathData(data: any): PathSegment[];
    /**
     * Walks an arc in one degree steps, accumulating its length. Returns the
     * angle `length` along the arc, or its end angle and total length when
     * `length` is past the end.
     */
    private static _walkArc;
    static calcLength(x: any, y: any, cmd: any, points: any): number;
    static convertEndpointToCenterParameterization(x1: number, y1: number, x2: number, y2: number, fa: number, fs: number, rx: number, ry: number, psiDeg: number): number[];
}
/**
 * get width of the path. It is computed from the path data and cannot be set
 * @name Konva.Path#width
 * @method
 * @returns {Number}
 * @example
 * var width = path.width();
 */
/**
 * get height of the path. It is computed from the path data and cannot be set
 * @name Konva.Path#height
 * @method
 * @returns {Number}
 * @example
 * var height = path.height();
 */
