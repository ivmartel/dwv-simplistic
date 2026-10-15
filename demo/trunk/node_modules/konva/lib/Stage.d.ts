import type { ContainerConfig } from './Container.ts';
import { Container } from './Container.ts';
import { SceneCanvas, HitCanvas } from './Canvas.ts';
import type { GetSet, Vector2d } from './types.ts';
import type { Shape } from './Shape.ts';
import type { Layer } from './Layer.ts';
export interface StageConfig extends ContainerConfig {
    container?: HTMLDivElement | string;
    eventBatchFunc?: (callback: () => void) => void;
}
type Click = {
    shape: Shape | null;
    time: number;
};
type EventType = 'mouse' | 'touch' | 'pointer';
type PointerState = {
    targetShape?: Shape;
    downPosition?: Vector2d;
    pointerType?: string;
    relatedPointer?: PointerState;
    clickStartShape?: Shape | null;
    lastClick?: Click;
};
export declare const stages: Stage[];
/**
 * Stage constructor.  A stage is used to contain multiple layers
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @param {String|Element} config.container Container selector or DOM element
 * @@nodeParams
 * @example
 * var stage = new Konva.Stage({
 *   width: 500,
 *   height: 800,
 *   container: 'containerId' // or "#containerId" or ".containerClass"
 * });
 */
export declare class Stage extends Container<Layer, StageConfig> {
    content: HTMLDivElement;
    pointerPos: Vector2d | null;
    _pointerPositions: (Vector2d & {
        id?: number;
    })[];
    _changedPointerPositions: (Vector2d & {
        id: number;
    })[];
    _pointerEventType?: EventType;
    _pointerStates: Map<string, PointerState>;
    _lastClicks: Partial<Record<EventType, Click>>;
    bufferHitCanvas: HitCanvas;
    constructor(config: StageConfig);
    _validateAdd(child: any): void;
    _checkVisibility(): void;
    /**
     * The window the stage is rendered in. It is not always the window Konva was
     * imported into: the container may belong to an iframe, or to a window
     * opened with `window.open`.
     */
    _getOwnerWindow(): Window | null;
    /**
     * set container dom element which contains the stage wrapper div element
     * @method
     * @name Konva.Stage#setContainer
     * @param {DomElement} container can pass in a dom element or id string
     */
    setContainer(container: any): this;
    shouldDrawHit(): boolean;
    /**
     * clear all layers
     * @method
     * @name Konva.Stage#clear
     */
    clear(): this;
    clone(obj?: any): this;
    destroy(): this;
    /**
     * returns ABSOLUTE pointer position which can be a touch position or mouse position
     * pointer position doesn't include any transforms (such as scale) of the stage
     * it is just a plain position of pointer relative to top-left corner of the canvas
     * @method
     * @name Konva.Stage#getPointerPosition
     * @returns {Vector2d|null}
     */
    getPointerPosition(): Vector2d | null;
    _getPointerById(id?: number): (Vector2d & {
        id?: number;
    }) | undefined;
    getPointersPositions(): (Vector2d & {
        id?: number;
    })[];
    getStage(): this;
    getContent(): HTMLDivElement;
    _toKonvaCanvas(config: any): SceneCanvas;
    /**
     * get visible intersection shape. This is the preferred
     *  method for determining if a point intersects a shape or not.
     *  It reads the hit canvas, so it finds what pointer events would: nodes with
     *  listening set to false or invisible nodes are not detected, a shape with opacity 0
     *  is, and `hitStrokeWidth` counts. The position is relative to the top left corner of the
     * stage container, like `stage.getPointerPosition()`, without the stage transform
     * @method
     * @name Konva.Stage#getIntersection
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Konva.Node}
     * @example
     * var shape = stage.getIntersection({x: 50, y: 50});
     */
    getIntersection(pos: Vector2d): Shape<import("./Shape.ts").ShapeConfig> | null;
    _resizeDOM(): void;
    add(layer: Layer, ...rest: any[]): this;
    getParent(): null;
    getLayer(): null;
    hasPointerCapture(pointerId: number): boolean;
    setPointerCapture(pointerId: number): void;
    releaseCapture(pointerId: number): void;
    /**
     * returns an array of layers
     * @method
     * @name Konva.Stage#getLayers
     */
    getLayers(): Layer[];
    _bindContentEvents(): void;
    _batchEvents(callback: () => void): void;
    _pointerenter(evt: PointerEvent): void;
    _pointerover(evt: any): void;
    _pointerEventsEnabled(): boolean;
    _cancelClick(pointerId: number | undefined, eventType?: EventType): void;
    _pointerleave(evt: any): void;
    _pointerdown(evt: TouchEvent | MouseEvent | PointerEvent): void;
    _pointermove(evt: TouchEvent | MouseEvent | PointerEvent): void;
    _pointerup(evt: any): void;
    _contextmenu(evt: any): void;
    _wheel(evt: any): void;
    _pointercancel(evt: PointerEvent | TouchEvent): void;
    _lostpointercapture(evt: PointerEvent): void;
    /**
     * manually register pointers positions (mouse/touch) in the stage.
     * So you can use stage.getPointerPosition(). Usually you don't need to use that method
     * because all internal events are automatically registered. It may be useful if event
     * is triggered outside of the stage, but you still want to use Konva methods to get pointers position.
     * @method
     * @name Konva.Stage#setPointersPositions
     * @param {Object} evt Event object
     * @example
     *
     * window.addEventListener('mousemove', (e) => {
     *   stage.setPointersPositions(e);
     * });
     */
    setPointersPositions(evt: any): void;
    _setPointerPosition(evt: any): void;
    _getContentPosition(): {
        top: number;
        left: number;
        scaleX: number;
        scaleY: number;
    };
    _buildDOM(): void;
    cache(): this;
    clearCache(): this;
    /**
     * batch draw
     * @method
     * @name Konva.Stage#batchDraw
     * @return {Konva.Stage} this
     */
    batchDraw(): this;
    container: GetSet<HTMLDivElement, this, HTMLDivElement | string>;
    eventBatchFunc: GetSet<((callback: () => void) => void) | undefined, this>;
}
export {};
