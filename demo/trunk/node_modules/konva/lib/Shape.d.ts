import type { GetClientRectConfig, NodeConfig } from './Node.ts';
import { Node } from './Node.ts';
import type { Context } from './Context.ts';
import type { GetSet, Vector2d, IRect } from './types.ts';
import type { HitCanvas, SceneCanvas } from './Canvas.ts';
export type ShapeConfigHandler<TTarget> = {
    bivarianceHack(ctx: Context, shape: TTarget): void;
}['bivarianceHack'];
export type LineJoin = 'round' | 'bevel' | 'miter';
export type LineCap = 'butt' | 'round' | 'square';
export type ShapeConfig = NodeConfig & {
    fill?: string | CanvasGradient;
    fillPatternImage?: HTMLImageElement;
    fillPatternX?: number;
    fillPatternY?: number;
    fillPatternOffset?: Vector2d;
    fillPatternOffsetX?: number;
    fillPatternOffsetY?: number;
    fillPatternScale?: Vector2d;
    fillPatternScaleX?: number;
    fillPatternScaleY?: number;
    fillPatternRotation?: number;
    fillPatternRepeat?: string;
    fillLinearGradientStartPoint?: Vector2d;
    fillLinearGradientStartPointX?: number;
    fillLinearGradientStartPointY?: number;
    fillLinearGradientEndPoint?: Vector2d;
    fillLinearGradientEndPointX?: number;
    fillLinearGradientEndPointY?: number;
    fillLinearGradientColorStops?: Array<number | string>;
    strokeLinearGradientStartPoint?: Vector2d;
    strokeLinearGradientStartPointX?: number;
    strokeLinearGradientStartPointY?: number;
    strokeLinearGradientEndPoint?: Vector2d;
    strokeLinearGradientEndPointX?: number;
    strokeLinearGradientEndPointY?: number;
    strokeLinearGradientColorStops?: Array<number | string>;
    fillRadialGradientStartPoint?: Vector2d;
    fillRadialGradientStartPointX?: number;
    fillRadialGradientStartPointY?: number;
    fillRadialGradientEndPoint?: Vector2d;
    fillRadialGradientEndPointX?: number;
    fillRadialGradientEndPointY?: number;
    fillRadialGradientStartRadius?: number;
    fillRadialGradientEndRadius?: number;
    fillRadialGradientColorStops?: Array<number | string>;
    fillEnabled?: boolean;
    fillPriority?: string;
    fillRule?: CanvasFillRule;
    stroke?: string | CanvasGradient;
    strokeWidth?: number;
    fillAfterStrokeEnabled?: boolean;
    hitStrokeWidth?: number | string;
    strokeScaleEnabled?: boolean;
    strokeHitEnabled?: boolean;
    strokeEnabled?: boolean;
    lineJoin?: LineJoin;
    lineCap?: LineCap;
    miterLimit?: number;
    sceneFunc?: (con: Context, shape: Shape) => void;
    hitFunc?: (con: Context, shape: Shape) => void;
    selfRectFunc?: (shape: Shape) => IRect;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffset?: Vector2d;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
    shadowEnabled?: boolean;
    shadowForStrokeEnabled?: boolean;
    dash?: number[];
    dashOffset?: number;
    dashEnabled?: boolean;
    perfectDrawEnabled?: boolean;
};
export type ShapeGetClientRectConfig = GetClientRectConfig;
export type FillFuncOutput = void | [Path2D | CanvasFillRule] | [Path2D, CanvasFillRule];
export declare const shapes: {
    [key: string]: Shape;
};
/**
 * Shape constructor.  Shapes are primitive objects such as rectangles,
 *  circles, text, lines, etc.
 * @constructor
 * @memberof Konva
 * @augments Konva.Node
 * @param {Object} config
 * @@shapeParams
 * @@nodeParams
 * @example
 * var customShape = new Konva.Shape({
 *   x: 5,
 *   y: 10,
 *   fill: 'red',
 *   // a Konva.Canvas renderer is passed into the sceneFunc function
 *   sceneFunc (context, shape) {
 *     context.beginPath();
 *     context.moveTo(200, 50);
 *     context.lineTo(420, 80);
 *     context.quadraticCurveTo(300, 100, 260, 170);
 *     context.closePath();
 *     // Konva specific method
 *     context.fillStrokeShape(shape);
 *   }
 *});
 */
export declare class Shape<Config extends ShapeConfig = ShapeConfig> extends Node<Config> {
    _centroid: boolean;
    colorKey: string;
    _fillFunc: (ctx: Context) => FillFuncOutput;
    _strokeFunc: (ctx: Context) => void;
    _fillFuncHit: (ctx: Context) => void;
    _strokeFuncHit: (ctx: Context) => void;
    constructor(config?: Config);
    /**
     * @deprecated
     */
    getContext(): Context;
    /**
     * @deprecated
     */
    getCanvas(): SceneCanvas;
    getSceneFunc(): any;
    getHitFunc(): any;
    /**
     * returns whether or not a shadow will be rendered
     * @method
     * @name Konva.Shape#hasShadow
     * @returns {Boolean}
     */
    hasShadow(): any;
    _hasShadow(): boolean;
    _getFillPattern(): any;
    __getFillPattern(): CanvasPattern | null | undefined;
    _getLinearGradient(): any;
    __getLinearGradient(): CanvasGradient | undefined;
    _getRadialGradient(): any;
    __getRadialGradient(): CanvasGradient | undefined;
    getShadowRGBA(): any;
    _getShadowRGBA(): string | undefined;
    /**
     * returns whether or not the shape will be filled
     * @method
     * @name Konva.Shape#hasFill
     * @returns {Boolean}
     */
    hasFill(): any;
    _hasFill(): boolean;
    /**
     * returns whether or not the shape will be stroked
     * @method
     * @name Konva.Shape#hasStroke
     * @returns {Boolean}
     */
    hasStroke(): any;
    _hasStroke(): boolean;
    hasHitStroke(): any;
    /**
     * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
     *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
     *  consecutively.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
     *  because it performs much better. A shape that is invisible, not listening or not on a stage
     *  never intersects
     * @method
     * @name Konva.Shape#intersects
     * @param {Object} point
     * @param {Number} point.x
     * @param {Number} point.y
     * @returns {Boolean}
     */
    intersects(point: Vector2d): boolean;
    destroy(): this;
    _useBufferCanvas(forceFill?: boolean, opacity?: any): boolean;
    setStrokeHitEnabled(val: number): void;
    getStrokeHitEnabled(): boolean;
    /**
     * return self rectangle (x, y, width, height) of shape.
     * This method are not taken into account transformation and styles.
     * @method
     * @name Konva.Shape#getSelfRect
     * @returns {Object} rect with {x, y, width, height} properties
     * @example
     *
     * rect.getSelfRect();  // return {x:0, y:0, width:rect.width(), height:rect.height()}
     * circle.getSelfRect();  // return {x: - circle.width() / 2, y: - circle.height() / 2, width:circle.width(), height:circle.height()}
     *
     */
    getSelfRect(): IRect;
    _getSelfRectForDrawing(): IRect;
    getClientRect(config?: ShapeGetClientRectConfig): IRect;
    _getStrokePadding(miterLimit?: number): number;
    drawScene(can?: SceneCanvas, top?: Node): this;
    drawHit(can?: HitCanvas, top?: Node): this;
    /**
     * draw hit graph using the cached scene canvas
     * @method
     * @name Konva.Shape#drawHitFromCache
     * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
     *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.
     *  The default is 0
     * @returns {Konva.Shape}
     * @example
     * shape.cache();
     * shape.drawHitFromCache();
     */
    drawHitFromCache(alphaThreshold?: number): this;
    hasPointerCapture(pointerId: number): boolean;
    setPointerCapture(pointerId: number): void;
    releaseCapture(pointerId: number): void;
    draggable: GetSet<boolean, this>;
    embossBlend: GetSet<boolean, this>;
    dash: GetSet<number[], this>;
    dashEnabled: GetSet<boolean, this>;
    dashOffset: GetSet<number, this>;
    fill: GetSet<string | CanvasGradient, this>;
    fillEnabled: GetSet<boolean, this>;
    fillLinearGradientColorStops: GetSet<Array<number | string>, this>;
    fillLinearGradientStartPoint: GetSet<Vector2d, this>;
    fillLinearGradientStartPointX: GetSet<number, this>;
    fillLinearGradientStartPointY: GetSet<number, this>;
    fillLinearGradientEndPoint: GetSet<Vector2d, this>;
    fillLinearGradientEndPointX: GetSet<number, this>;
    fillLinearGradientEndPointY: GetSet<number, this>;
    fillPatternImage: GetSet<HTMLImageElement | HTMLCanvasElement, this>;
    fillRadialGradientStartRadius: GetSet<number, this>;
    fillRadialGradientEndRadius: GetSet<number, this>;
    fillRadialGradientColorStops: GetSet<Array<number | string>, this>;
    fillRadialGradientStartPoint: GetSet<Vector2d, this>;
    fillRadialGradientStartPointX: GetSet<number, this>;
    fillRadialGradientStartPointY: GetSet<number, this>;
    fillRadialGradientEndPoint: GetSet<Vector2d, this>;
    fillRadialGradientEndPointX: GetSet<number, this>;
    fillRadialGradientEndPointY: GetSet<number, this>;
    fillPatternOffset: GetSet<Vector2d, this>;
    fillPatternOffsetX: GetSet<number, this>;
    fillPatternOffsetY: GetSet<number, this>;
    fillPatternRepeat: GetSet<string, this>;
    fillPatternRotation: GetSet<number, this>;
    fillPatternScale: GetSet<Vector2d, this>;
    fillPatternScaleX: GetSet<number, this>;
    fillPatternScaleY: GetSet<number, this>;
    fillPatternX: GetSet<number, this>;
    fillPatternY: GetSet<number, this>;
    fillPriority: GetSet<string, this>;
    hitFunc: GetSet<ShapeConfigHandler<this>, this>;
    lineCap: GetSet<LineCap, this>;
    lineJoin: GetSet<LineJoin, this>;
    miterLimit: GetSet<number, this>;
    perfectDrawEnabled: GetSet<boolean, this>;
    sceneFunc: GetSet<ShapeConfigHandler<this>, this>;
    selfRectFunc: GetSet<((shape: Shape) => IRect) | undefined, this>;
    shadowColor: GetSet<string, this>;
    shadowEnabled: GetSet<boolean, this>;
    shadowForStrokeEnabled: GetSet<boolean, this>;
    shadowOffset: GetSet<Vector2d, this>;
    shadowOffsetX: GetSet<number, this>;
    shadowOffsetY: GetSet<number, this>;
    shadowOpacity: GetSet<number, this>;
    shadowBlur: GetSet<number, this>;
    stroke: GetSet<string | CanvasGradient, this>;
    strokeEnabled: GetSet<boolean, this>;
    fillAfterStrokeEnabled: GetSet<boolean, this>;
    strokeScaleEnabled: GetSet<boolean, this>;
    strokeHitEnabled: GetSet<boolean, this>;
    strokeWidth: GetSet<number, this>;
    hitStrokeWidth: GetSet<number | 'auto', this>;
    strokeLinearGradientStartPoint: GetSet<Vector2d, this>;
    strokeLinearGradientEndPoint: GetSet<Vector2d, this>;
    strokeLinearGradientColorStops: GetSet<Array<number | string>, this>;
    strokeLinearGradientStartPointX: GetSet<number, this>;
    strokeLinearGradientStartPointY: GetSet<number, this>;
    strokeLinearGradientEndPointX: GetSet<number, this>;
    strokeLinearGradientEndPointY: GetSet<number, this>;
    fillRule: GetSet<CanvasFillRule, this>;
}
