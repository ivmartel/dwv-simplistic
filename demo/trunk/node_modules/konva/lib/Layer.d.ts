import type { ContainerConfig } from './Container.ts';
import { Container } from './Container.ts';
import { Node } from './Node.ts';
import { SceneCanvas, HitCanvas } from './Canvas.ts';
import type { Stage } from './Stage.ts';
import type { GetSet, IRect, Vector2d } from './types.ts';
import type { Group } from './Group.ts';
import type { Shape } from './Shape.ts';
export interface LayerConfig extends ContainerConfig {
    clearBeforeDraw?: boolean;
    hitGraphEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
}
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
 * to clear the canvas before each layer draw.  The default value is true.
 * @@nodeParams
 * @@containerParams
 * @example
 * var layer = new Konva.Layer();
 * stage.add(layer);
 * // now you can add shapes, groups into the layer
 */
export declare class Layer extends Container<Group | Shape> {
    canvas: SceneCanvas;
    hitCanvas: HitCanvas;
    _waitingForDraw: boolean;
    constructor(config?: LayerConfig);
    createPNGStream(): any;
    /**
     * get layer canvas wrapper
     * @method
     * @name Konva.Layer#getCanvas
     */
    getCanvas(): SceneCanvas;
    /**
     * get native canvas element
     * @method
     * @name Konva.Layer#getNativeCanvasElement
     */
    getNativeCanvasElement(): HTMLCanvasElement;
    /**
     * get layer hit canvas
     * @method
     * @name Konva.Layer#getHitCanvas
     */
    getHitCanvas(): HitCanvas;
    /**
     * get layer canvas context
     * @method
     * @name Konva.Layer#getContext
     */
    getContext(): import("./Context.ts").Context;
    /**
     * clear the scene and hit canvas of the layer. The nodes stay and are
     * drawn again by the next `draw()`
     * @method
     * @name Konva.Layer#clear
     * @param {Object} [bounds] clear only this rectangle: `{ x, y, width, height }`
     * @returns {Konva.Layer}
     * @example
     * layer.clear();
     * layer.clear({ x: 0, y: 0, width: 100, height: 100 });
     */
    clear(bounds?: IRect): this;
    setZIndex(index: number): this;
    moveToTop(): boolean;
    moveUp(): boolean;
    moveDown(): boolean;
    moveToBottom(): boolean;
    getLayer(): this;
    remove(): this;
    getStage(): Stage;
    _setSize({ width, height }: {
        width: any;
        height: any;
    }): this;
    _syncHitCanvasSize(): void;
    _validateAdd(child: any): void;
    _toKonvaCanvas(config: any): SceneCanvas;
    _checkVisibility(): void;
    _setSmoothEnabled(): void;
    /**
     * get/set width of layer. getter return width of stage. setter doing nothing.
     * if you want change width use `stage.width(value);`
     * @name Konva.Layer#width
     * @method
     * @returns {Number}
     * @example
     * var width = layer.width();
     */
    getWidth(): number | undefined;
    setWidth(): void;
    /**
     * get/set height of layer.getter return height of stage. setter doing nothing.
     * if you want change height use `stage.height(value);`
     * @name Konva.Layer#height
     * @method
     * @returns {Number}
     * @example
     * var height = layer.height();
     */
    getHeight(): number | undefined;
    setHeight(): void;
    /**
     * batch draw. this function will not do immediate draw
     * but it will schedule drawing to next tick (requestAnimFrame)
     * @method
     * @name Konva.Layer#batchDraw
     * @return {Konva.Layer} this
     */
    batchDraw(): this;
    /**
     * get visible intersection shape. This is the preferred
     * method for determining if a point intersects a shape or not.
     * It reads the hit canvas, so it finds what pointer events would: nodes with
     * listening set to false or invisible nodes are not detected, a shape with opacity 0
     * is, and `hitStrokeWidth` counts. The position is relative to the top left corner of the
     * stage container, like `stage.getPointerPosition()`, without the stage transform
     * @method
     * @name Konva.Layer#getIntersection
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Konva.Node}
     * @example
     * var shape = layer.getIntersection({x: 50, y: 50});
     */
    getIntersection(pos: Vector2d): Shape<import("./Shape.ts").ShapeConfig> | null;
    _getIntersection(pos: Vector2d): {
        shape?: Shape;
        antialiased?: boolean;
    };
    drawScene(can?: SceneCanvas, top?: Node): this;
    shouldDrawHit(top?: Node): boolean;
    drawHit(can?: HitCanvas, top?: Node): this;
    /**
     * enable hit graph. **DEPRECATED!** Use `layer.listening(true)` instead.
     * @name Konva.Layer#enableHitGraph
     * @method
     * @returns {Layer}
     */
    enableHitGraph(): this;
    /**
     * disable hit graph. **DEPRECATED!** Use `layer.listening(false)` instead.
     * @name Konva.Layer#disableHitGraph
     * @method
     * @returns {Layer}
     */
    disableHitGraph(): this;
    setHitGraphEnabled(val: any): void;
    getHitGraphEnabled(val: any): boolean;
    /**
     * Show or hide hit canvas over the stage. May be useful for debugging custom hitFunc
     * @name Konva.Layer#toggleHitCanvas
     * @method
     */
    toggleHitCanvas(): void;
    destroy(): this;
    hitGraphEnabled: GetSet<boolean, this>;
    clearBeforeDraw: GetSet<boolean, this>;
    imageSmoothingEnabled: GetSet<boolean, this>;
}
/**
 * get/set hitGraphEnabled flag.  **DEPRECATED!** Use `layer.listening(false)` instead.
 *  Disabling the hit graph will greatly increase
 *  draw performance because the hit graph will not be redrawn each time the layer is
 *  drawn.  This, however, also disables mouse/touch event detection
 * @name Konva.Layer#hitGraphEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get hitGraphEnabled flag
 * var hitGraphEnabled = layer.hitGraphEnabled();
 *
 * // disable hit graph
 * layer.hitGraphEnabled(false);
 *
 * // enable hit graph
 * layer.hitGraphEnabled(true);
 */
