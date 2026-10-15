export declare const tValues: number[][];
export declare const cValues: number[][];
export declare const binomialCoefficients: number[][];
export declare const getCubicArcLength: (xs: number[], ys: number[], t: number) => number;
export declare const getQuadraticArcLength: (xs: number[], ys: number[], t?: number) => number;
export declare const t2length: (length: number, totalLength: number, func: (t: number) => number) => number;
/**
 * Points where a quadratic bezier segment reaches its highest or lowest value
 * on one of the two axes, as a flat [x, y, x, y, ...] list. The two end points
 * are not included, because the caller knows them already.
 */
export declare const getQuadraticExtremaPoints: (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) => number[];
/**
 * Points where a cubic bezier segment reaches its highest or lowest value on
 * one of the two axes, as a flat [x, y, x, y, ...] list. The two end points
 * are not included, because the caller knows them already.
 */
export declare const getCubicExtremaPoints: (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => number[];
