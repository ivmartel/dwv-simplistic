import type { Canvas, SceneCanvas } from './Canvas.ts';
import type { Shape } from './Shape.ts';
import type { IRect } from './types.ts';
import type { Node } from './Node.ts';
declare const CONTEXT_PROPERTIES: readonly ["fillStyle", "strokeStyle", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "letterSpacing", "lineCap", "lineDashOffset", "lineJoin", "lineWidth", "miterLimit", "direction", "font", "textAlign", "textBaseline", "globalAlpha", "globalCompositeOperation", "imageSmoothingEnabled", "imageSmoothingQuality", "filter"];
export declare function isCSSFiltersSupported(): boolean;
interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
    letterSpacing: string;
}
/**
 * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
 * With core Konva shapes you don't need to use this object. But you will use it if you want to create
 * a [custom shape](/docs/react/Custom_Shape.html) or a [custom hit regions](/docs/events/Custom_Hit_Region.html).
 * For full information about each 2d context API use [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * @constructor
 * @memberof Konva
 * @example
 * const rect = new Konva.Shape({
 *    fill: 'red',
 *    width: 100,
 *    height: 100,
 *    sceneFunc: (ctx, shape) => {
 *      // ctx - is context wrapper
 *      // shape - is instance of Konva.Shape, so it equals to "rect" variable
 *      ctx.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
 *
 *      // automatically fill shape from props and draw hit region
 *      ctx.fillStrokeShape(shape);
 *    }
 * })
 */
export declare class Context {
    canvas: Canvas;
    _context: CanvasRenderingContext2D;
    traceArr: Array<string>;
    constructor(canvas: Canvas);
    /**
     * fill shape
     * @method
     * @name Konva.Context#fillShape
     * @param {Konva.Shape} shape
     */
    fillShape(shape: Shape): void;
    _fill(shape: Shape): void;
    /**
     * stroke shape
     * @method
     * @name Konva.Context#strokeShape
     * @param {Konva.Shape} shape
     */
    strokeShape(shape: Shape): void;
    _stroke(shape: Shape): void;
    /**
     * fill then stroke
     * @method
     * @name Konva.Context#fillStrokeShape
     * @param {Konva.Shape} shape
     */
    fillStrokeShape(shape: Shape): void;
    getTrace(relaxed?: boolean, rounded?: boolean): string;
    clearTrace(): void;
    _trace(str: any): void;
    /**
     * reset canvas context transform
     * @method
     * @name Konva.Context#reset
     */
    reset(): void;
    /**
     * get canvas wrapper
     * @method
     * @name Konva.Context#getCanvas
     * @returns {Konva.Canvas}
     */
    getCanvas(): Canvas;
    /**
     * clear canvas
     * @method
     * @name Konva.Context#clear
     * @param {Object} [bounds]
     * @param {Number} [bounds.x]
     * @param {Number} [bounds.y]
     * @param {Number} [bounds.width]
     * @param {Number} [bounds.height]
     */
    clear(bounds?: IRect): void;
    _drawDeviceBuffer(canvas: SceneCanvas): void;
    _applyLineCap(shape: Shape): void;
    _opacityRoot: Node | undefined;
    _getOpacity(shape: Node): any;
    _applyOpacity(shape: Node): void;
    _applyLineJoin(shape: Shape): void;
    _applyMiterLimit(shape: Shape): void;
    setAttr(attr: string, val: any): void;
    /**
     * arc function.
     * @method
     * @name Konva.Context#arc
     */
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise?: boolean): void;
    /**
     * arcTo function.
     * @method
     * @name Konva.Context#arcTo
     *
     */
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /**
     * beginPath function.
     * @method
     * @name Konva.Context#beginPath
     */
    beginPath(): void;
    /**
     * bezierCurveTo function.
     * @method
     * @name Konva.Context#bezierCurveTo
     */
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    /**
     * clearRect function.
     * @method
     * @name Konva.Context#clearRect
     */
    clearRect(x: number, y: number, width: number, height: number): void;
    /**
     * clip function.
     * @method
     * @name Konva.Context#clip
     */
    clip(fillRule?: CanvasFillRule): void;
    clip(path: Path2D, fillRule?: CanvasFillRule): void;
    /**
     * closePath function.
     * @method
     * @name Konva.Context#closePath
     */
    closePath(): void;
    /**
     * createImageData function.
     * @method
     * @name Konva.Context#createImageData
     */
    createImageData(width: any, height: any): ImageData | undefined;
    /**
     * createLinearGradient function.
     * @method
     * @name Konva.Context#createLinearGradient
     */
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    /**
     * createPattern function.
     * @method
     * @name Konva.Context#createPattern
     */
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
    /**
     * createRadialGradient function.
     * @method
     * @name Konva.Context#createRadialGradient
     */
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    /**
     * drawImage function.
     * @method
     * @name Konva.Context#drawImage
     */
    drawImage(image: CanvasImageSource, sx: number, sy: number, sWidth?: number, sHeight?: number, dx?: number, dy?: number, dWidth?: number, dHeight?: number): void;
    /**
     * ellipse function.
     * @method
     * @name Konva.Context#ellipse
     */
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    /**
     * isPointInPath function.
     * @method
     * @name Konva.Context#isPointInPath
     */
    isPointInPath(x: number, y: number, path?: Path2D, fillRule?: CanvasFillRule): boolean;
    /**
     * fill function.
     * @method
     * @name Konva.Context#fill
     */
    fill(fillRule?: CanvasFillRule): void;
    fill(path: Path2D, fillRule?: CanvasFillRule): void;
    /**
     * fillRect function.
     * @method
     * @name Konva.Context#fillRect
     */
    fillRect(x: number, y: number, width: number, height: number): void;
    /**
     * strokeRect function.
     * @method
     * @name Konva.Context#strokeRect
     */
    strokeRect(x: number, y: number, width: number, height: number): void;
    /**
     * fillText function.
     * @method
     * @name Konva.Context#fillText
     */
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    /**
     * measureText function.
     * @method
     * @name Konva.Context#measureText
     */
    measureText(text: string): TextMetrics;
    /**
     * getImageData function.
     * @method
     * @name Konva.Context#getImageData
     */
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    /**
     * lineTo function.
     * @method
     * @name Konva.Context#lineTo
     */
    lineTo(x: number, y: number): void;
    /**
     * moveTo function.
     * @method
     * @name Konva.Context#moveTo
     */
    moveTo(x: number, y: number): void;
    /**
     * rect function.
     * @method
     * @name Konva.Context#rect
     */
    rect(x: number, y: number, width: number, height: number): void;
    /**
     * roundRect function.
     * @method
     * @name Konva.Context#roundRect
     */
    roundRect(x: number, y: number, width: number, height: number, radii: number | DOMPointInit | (number | DOMPointInit)[]): void;
    /**
     * putImageData function.
     * @method
     * @name Konva.Context#putImageData
     */
    putImageData(imageData: ImageData, dx: number, dy: number): void;
    /**
     * quadraticCurveTo function.
     * @method
     * @name Konva.Context#quadraticCurveTo
     */
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    /**
     * restore function.
     * @method
     * @name Konva.Context#restore
     */
    restore(): void;
    /**
     * rotate function.
     * @method
     * @name Konva.Context#rotate
     */
    rotate(angle: number): void;
    /**
     * save function.
     * @method
     * @name Konva.Context#save
     */
    save(): void;
    /**
     * scale function.
     * @method
     * @name Konva.Context#scale
     */
    scale(x: number, y: number): void;
    /**
     * setLineDash function.
     * @method
     * @name Konva.Context#setLineDash
     */
    setLineDash(segments: number[]): void;
    /**
     * getLineDash function.
     * @method
     * @name Konva.Context#getLineDash
     */
    getLineDash(): number[];
    /**
     * setTransform function.
     * @method
     * @name Konva.Context#setTransform
     */
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    /**
     * stroke function.
     * @method
     * @name Konva.Context#stroke
     */
    stroke(path2d?: Path2D): void;
    /**
     * strokeText function.
     * @method
     * @name Konva.Context#strokeText
     */
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    /**
     * transform function.
     * @method
     * @name Konva.Context#transform
     */
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    /**
     * translate function.
     * @method
     * @name Konva.Context#translate
     */
    translate(x: number, y: number): void;
    _enableTrace(): void;
    _applyGlobalCompositeOperation(node: any): void;
}
type CanvasContextProps = Pick<ExtendedCanvasRenderingContext2D, (typeof CONTEXT_PROPERTIES)[number]>;
export interface Context extends CanvasContextProps {
}
export declare class SceneContext extends Context {
    constructor(canvas: Canvas, { willReadFrequently }?: {
        willReadFrequently?: boolean | undefined;
    });
    _getFillPattern(shape: Shape): any;
    _getFillStyle(shape: Shape): any;
    _fill(shape: Shape): void;
    _strokeLinearGradient(shape: any): void;
    _applyStrokeStyle(shape: Shape): void;
    _stroke(shape: any): void;
    _applyShadow(shape: any): void;
}
export declare class HitContext extends Context {
    constructor(canvas: Canvas);
    _fill(shape: Shape): void;
    strokeShape(shape: Shape): void;
    _stroke(shape: any): void;
}
export {};
