import type { Context } from './Context.ts';
import type { IRect, RGB, Vector2d } from './types.ts';
/**
 * Transform constructor.
 * In most of the cases you don't need to use it in your app. Because it is for internal usage in Konva core.
 * But there is a documentation for that class in case you still want
 * to make some manual calculations.
 * @constructor
 * @param {Array} [m] Optional six-element matrix
 * @memberof Konva
 */
export declare class Transform {
    m: Array<number>;
    dirty: boolean;
    constructor(m?: Array<number>);
    reset(): void;
    /**
     * Copy Konva.Transform object
     * @method
     * @name Konva.Transform#copy
     * @returns {Konva.Transform}
     * @example
     * const tr = shape.getTransform().copy()
     */
    copy(): Transform;
    copyInto(tr: Transform): void;
    /**
     * Transform point
     * @method
     * @name Konva.Transform#point
     * @param {Object} point 2D point(x, y)
     * @returns {Object} 2D point(x, y)
     */
    point(point: Vector2d): {
        x: number;
        y: number;
    };
    _getTransformedRect(rect: IRect): IRect;
    /**
     * Apply translation
     * @method
     * @name Konva.Transform#translate
     * @param {Number} x
     * @param {Number} y
     * @returns {Konva.Transform}
     */
    translate(x: number, y: number): this;
    /**
     * Apply scale
     * @method
     * @name Konva.Transform#scale
     * @param {Number} sx
     * @param {Number} sy
     * @returns {Konva.Transform}
     */
    scale(sx: number, sy: number): this;
    /**
     * Apply rotation
     * @method
     * @name Konva.Transform#rotate
     * @param {Number} rad  Angle in radians
     * @returns {Konva.Transform}
     */
    rotate(rad: number): this;
    /**
     * Returns the translation
     * @method
     * @name Konva.Transform#getTranslation
     * @returns {Object} 2D point(x, y)
     */
    getTranslation(): {
        x: number;
        y: number;
    };
    /**
     * Apply skew
     * @method
     * @name Konva.Transform#skew
     * @param {Number} sx
     * @param {Number} sy
     * @returns {Konva.Transform}
     */
    skew(sx: number, sy: number): this;
    /**
     * Transform multiplication
     * @method
     * @name Konva.Transform#multiply
     * @param {Konva.Transform} matrix
     * @returns {Konva.Transform}
     */
    multiply(matrix: Transform): this;
    /**
     * Invert the matrix
     * @method
     * @name Konva.Transform#invert
     * @returns {Konva.Transform}
     */
    isInvertible(): boolean;
    invert(): this;
    /**
     * return matrix
     * @method
     * @name Konva.Transform#getMatrix
     */
    getMatrix(): number[];
    /**
     * convert transformation matrix back into node's attributes
     * @method
     * @name Konva.Transform#decompose
     * @returns {Konva.Transform}
     */
    decompose(): {
        x: number;
        y: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
        skewX: number;
        skewY: number;
    };
}
export declare const TypedArray: any;
export declare const Util: {
    _isElement(obj: any): obj is Element;
    _isFunction(obj: any): boolean;
    _isPlainObject(obj: any): boolean;
    _isArray(obj: any): obj is Array<any>;
    _isNumber(obj: any): obj is number;
    _isString(obj: any): obj is string;
    _isBoolean(obj: any): obj is boolean;
    isObject(val: any): val is object;
    isValidSelector(selector: any): boolean;
    _sign(number: number): 1 | -1;
    requestAnimFrame(callback: Function, win?: Window | null): void;
    createCanvasElement(): HTMLCanvasElement;
    createImageElement(): HTMLImageElement;
    _urlToImage(url: string, callback: Function, onError?: (error: Error) => void): void;
    _rgbToHex(r: number, g: number, b: number): string;
    _hexToRgb(hex: string): RGB;
    /**
     * return random hex color
     * @method
     * @memberof Konva.Util
     * @example
     * shape.fill(Konva.Util.getRandomColor());
     */
    getRandomColor(): string;
    /**
     * Check if canvas farbling is active (e.g., Brave browser fingerprinting protection)
     * @method
     * @memberof Konva.Util
     * @returns {Boolean}
     */
    isCanvasFarblingActive(): boolean;
    /**
     * Get a random color for hit detection (snapped to the hit color grid)
     * @method
     * @memberof Konva.Util
     * @returns {String} hex color string
     */
    getHitColor(): string;
    /**
     * Get hit color key from RGB values (snapped to the hit color grid)
     * @method
     * @memberof Konva.Util
     * @param {Number} r - red component (0-255)
     * @param {Number} g - green component (0-255)
     * @param {Number} b - blue component (0-255)
     * @returns {String} hex color key string
     */
    getHitColorKey(r: number, g: number, b: number): string;
    /**
     * Snap a hex color to the hit color grid
     * @method
     * @memberof Konva.Util
     * @param {String} hex - hex color string (e.g., "#ff00ff")
     * @returns {String} snapped hex color string
     */
    getSnappedHexColor(hex: string): string;
    /**
     * get RGB components of a color
     * @method
     * @memberof Konva.Util
     * @param {String} color
     * @example
     * // each of the following examples return {r:0, g:0, b:255}
     * var rgb = Konva.Util.getRGB('blue');
     * var rgb = Konva.Util.getRGB('#0000ff');
     * var rgb = Konva.Util.getRGB('rgb(0,0,255)');
     */
    getRGB(color: string): RGB;
    colorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _namedColorToRBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | null;
    _rgbColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _hex8ColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _hex6ColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _hex4ColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _hex3ColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _hslColorToRGBA(str: string): {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    _getPointsRect(points: ArrayLike<number>): IRect;
    /**
     * check intersection of two client rectangles
     * @method
     * @memberof Konva.Util
     * @param {Object} r1 - { x, y, width, height } client rectangle
     * @param {Object} r2 - { x, y, width, height } client rectangle
     * @example
     * const overlapping = Konva.Util.haveIntersection(shape1.getClientRect(), shape2.getClientRect());
     */
    haveIntersection(r1: IRect, r2: IRect): boolean;
    cloneObject<Any>(obj: Any): Any;
    _cloneValue(val: any): any;
    cloneArray(arr: Array<any>): any[];
    degToRad(deg: number): number;
    radToDeg(rad: number): number;
    _getRotation(radians: number): number;
    _capitalize(str: string): string;
    throw(str: string): never;
    error(str: string): void;
    warn(str: string): void;
    _batchEvents(batch: ((run: () => void) => void) | undefined, run: () => void): void;
    each(obj: object, func: Function): void;
    _inRange(val: number, left: number, right: number): boolean;
    _getProjectionToSegment(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any): any[];
    _getProjectionToLine(pt: Vector2d, line: Array<Vector2d>, isClosed: boolean): Vector2d;
    _prepareArrayForTween(startArray: any, endArray: any, isClosed: any): number[];
    _prepareToStringify<T>(obj: any, ancestors?: Set<object>): T;
    _assign<T, U>(target: T, source: U): T & U;
    _getEventType(type: string): "mouse" | "touch" | "pointer";
    _getFirstPointerId(evt: any): any;
    releaseCanvas(...canvases: HTMLCanvasElement[]): void;
    _cornerRadii(cornerRadius: number | number[], width: number, height: number): [number, number, number, number];
    drawRoundedRectPath(context: Context, width: number, height: number, cornerRadius: number | number[]): void;
    drawRoundedPolygonPath(context: Context, points: Vector2d[], sides: number, radius: number, cornerRadius: number | number[]): void;
};
export type AnyString<T> = T | (string & {});
